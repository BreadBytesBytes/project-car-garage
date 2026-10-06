import {
  serviceFailure,
  serviceSuccess,
  toUtcTimestamp,
  type AddModificationInput,
  type CreateVehicleInput,
  type ReplacementComponentInput,
  type ServiceResult,
  type UtcTimestamp,
  type Uuid,
  type Vehicle,
  type VehicleService,
} from '@project-car-garage/domain';
import type { SupabaseClient } from '@supabase/supabase-js';

type VehicleRow = {
  id: string;
  garage_id: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  nickname: string | null;
  vin: string | null;
  configuration_state: Vehicle['configurationState'];
  current_mileage: number;
  mileage_unit: Vehicle['mileageUnit'];
  notes: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

function mapVehicle(row: VehicleRow): Vehicle {
  return {
    id: row.id as Uuid,
    garageId: row.garage_id as Uuid,
    year: row.year,
    make: row.make,
    model: row.model,
    trim: row.trim,
    nickname: row.nickname,
    vin: row.vin,
    configurationState: row.configuration_state,
    currentMileage: row.current_mileage,
    mileageUnit: row.mileage_unit,
    notes: row.notes,
    archivedAt: row.archived_at as UtcTimestamp | null,
    createdAt: row.created_at as UtcTimestamp,
    updatedAt: row.updated_at as UtcTimestamp,
  };
}

function invalidCreateInput(input: CreateVehicleInput): string | null {
  if (!Number.isInteger(input.year) || input.year < 1886 || input.year > 9999) {
    return 'Enter a valid model year.';
  }
  if (!input.make.trim() || !input.model.trim()) {
    return 'Make and model are required.';
  }
  if (!Number.isInteger(input.mileage) || input.mileage < 0) {
    return 'Mileage must be a non-negative whole number.';
  }
  if (input.usageModes.length === 0) return 'Choose at least one usage mode.';
  if (
    input.primaryUsageMode &&
    !input.usageModes.includes(input.primaryUsageMode)
  ) {
    return 'Primary usage must be one of the selected modes.';
  }
  return null;
}

function operationFailure(
  error: { code?: string } | null,
): ServiceResult<never> {
  if (error?.code === '42501') {
    return serviceFailure('FORBIDDEN', 'You cannot access this vehicle.');
  }
  if (error?.code === 'P0002') {
    return serviceFailure('NOT_FOUND', 'Vehicle not found.');
  }
  if (error?.code?.startsWith('22') || error?.code?.startsWith('23')) {
    return serviceFailure(
      'VALIDATION',
      'Check the vehicle details and try again.',
    );
  }
  return serviceFailure('UNEXPECTED', 'The vehicle operation failed.');
}

export class SupabaseVehicleService implements VehicleService {
  private readonly client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  async createVehicle(input: CreateVehicleInput) {
    const validationError = invalidCreateInput(input);
    if (validationError) return serviceFailure('VALIDATION', validationError);

    const { data, error } = await this.client.rpc('onboard_vehicle', {
      vehicle_year: input.year,
      vehicle_make: input.make,
      vehicle_model: input.model,
      vehicle_configuration_state: input.configurationState,
      vehicle_mileage: input.mileage,
      vehicle_mileage_unit: input.mileageUnit,
      vehicle_usage_modes: [...input.usageModes],
      replacement_components: input.components ?? [],
      added_modifications: input.modifications ?? [],
      vehicle_primary_usage_mode: input.primaryUsageMode ?? null,
      vehicle_trim: input.trim ?? null,
      vehicle_nickname: input.nickname ?? null,
      vehicle_vin: input.vin ?? null,
      vehicle_notes: input.notes ?? null,
    });

    return error || !data
      ? operationFailure(error)
      : serviceSuccess(mapVehicle(data as VehicleRow));
  }

  async listVehicles(includeArchived = false) {
    let query = this.client
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: true });
    if (!includeArchived) query = query.is('archived_at', null);
    const { data, error } = await query;

    return error
      ? operationFailure(error)
      : serviceSuccess((data as VehicleRow[]).map(mapVehicle));
  }

  async getVehicle(vehicleId: Uuid) {
    const { data, error } = await this.client
      .from('vehicles')
      .select('*')
      .eq('id', vehicleId)
      .maybeSingle();

    return error
      ? operationFailure(error)
      : serviceSuccess(data ? mapVehicle(data as VehicleRow) : null);
  }

  async updateVehicleConfiguration(
    vehicleId: Uuid,
    components: readonly ReplacementComponentInput[],
    modifications: readonly AddModificationInput[],
  ) {
    const { error } = await this.client.rpc('update_vehicle_configuration', {
      requested_vehicle_id: vehicleId,
      replacement_components: components,
      added_modifications: modifications,
    });
    return error ? operationFailure(error) : serviceSuccess(undefined);
  }

  async updateMileage(
    vehicleId: Uuid,
    mileage: number,
    recordedAt = new Date(),
  ) {
    if (!Number.isInteger(mileage) || mileage < 0) {
      return serviceFailure(
        'VALIDATION',
        'Mileage must be a non-negative whole number.',
        'mileage',
      );
    }
    const timestamp = toUtcTimestamp(recordedAt);
    if (!timestamp.ok) return timestamp;

    const { data, error } = await this.client.rpc('update_vehicle_mileage', {
      requested_vehicle_id: vehicleId,
      new_mileage: mileage,
      measured_at: timestamp.data,
    });
    return error || !data
      ? operationFailure(error)
      : serviceSuccess(mapVehicle(data as VehicleRow));
  }

  async archiveVehicle(vehicleId: Uuid) {
    const { data, error } = await this.client.rpc('archive_vehicle', {
      requested_vehicle_id: vehicleId,
    });
    return error || !data
      ? operationFailure(error)
      : serviceSuccess(mapVehicle(data as VehicleRow));
  }
}
