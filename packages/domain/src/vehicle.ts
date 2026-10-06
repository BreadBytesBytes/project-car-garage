import type {
  ArchiveState,
  EntityTimestamps,
  ServiceResult,
  UtcTimestamp,
  Uuid,
} from './index';

export type MileageUnit = 'mi' | 'km';
export type VehicleConfigurationState = 'stock' | 'modified' | 'swapped';
export type VehicleUsageMode =
  | 'street'
  | 'track'
  | 'autocross'
  | 'drag'
  | 'rally'
  | 'off_road'
  | 'show'
  | 'storage'
  | 'other';
export type VehicleComponentType =
  'chassis' | 'engine' | 'transmission' | 'differential' | 'other';
export type VehicleComponentOrigin =
  'original' | 'swapped' | 'unknown_history' | 'user_entered';
export type ModificationStatus = 'planned' | 'installed' | 'removed';

export type Vehicle = Readonly<
  EntityTimestamps &
    ArchiveState & {
      id: Uuid;
      garageId: Uuid;
      year: number;
      make: string;
      model: string;
      trim: string | null;
      nickname: string | null;
      vin: string | null;
      configurationState: VehicleConfigurationState;
      currentMileage: number;
      mileageUnit: MileageUnit;
      notes: string | null;
    }
>;

export type MileageHistoryRecord = Readonly<{
  id: Uuid;
  vehicleId: Uuid;
  mileage: number;
  mileageUnit: MileageUnit;
  recordedAt: UtcTimestamp;
  createdAt: UtcTimestamp;
}>;

export type VehicleComponent = Readonly<
  EntityTimestamps & {
    id: Uuid;
    vehicleId: Uuid;
    componentType: VehicleComponentType;
    manufacturer: string | null;
    family: string | null;
    model: string | null;
    variant: string | null;
    origin: VehicleComponentOrigin;
    isCurrent: boolean;
    installedOn: string | null;
    installedMileage: number | null;
    removedOn: string | null;
    notes: string | null;
  }
>;

export type Modification = Readonly<
  EntityTimestamps & {
    id: Uuid;
    vehicleId: Uuid;
    category: string;
    name: string;
    manufacturer: string | null;
    partNumber: string | null;
    status: ModificationStatus;
    installedOn: string | null;
    installedMileage: number | null;
    removedOn: string | null;
    notes: string | null;
  }
>;

export type VehicleUsageProfile = Readonly<
  EntityTimestamps & {
    vehicleId: Uuid;
    usageMode: VehicleUsageMode;
    isPrimary: boolean;
    intensity: string | null;
  }
>;

export type CreateVehicleInput = Readonly<{
  year: number;
  make: string;
  model: string;
  configurationState: VehicleConfigurationState;
  mileage: number;
  mileageUnit: MileageUnit;
  usageModes: readonly VehicleUsageMode[];
  primaryUsageMode?: VehicleUsageMode;
  trim?: string;
  nickname?: string;
  vin?: string;
  notes?: string;
}>;

export type ReplacementComponentInput = Readonly<{
  componentType: VehicleComponentType;
  origin: VehicleComponentOrigin;
  manufacturer?: string;
  family?: string;
  model?: string;
  variant?: string;
  installedOn?: string;
  installedMileage?: number;
  notes?: string;
}>;

export type AddModificationInput = Readonly<{
  category: string;
  name: string;
  status?: ModificationStatus;
  manufacturer?: string;
  partNumber?: string;
  installedOn?: string;
  installedMileage?: number;
  notes?: string;
}>;

export interface VehicleService {
  createVehicle(input: CreateVehicleInput): Promise<ServiceResult<Vehicle>>;
  listVehicles(
    includeArchived?: boolean,
  ): Promise<ServiceResult<readonly Vehicle[]>>;
  getVehicle(vehicleId: Uuid): Promise<ServiceResult<Vehicle | null>>;
  updateVehicleConfiguration(
    vehicleId: Uuid,
    components: readonly ReplacementComponentInput[],
    modifications: readonly AddModificationInput[],
  ): Promise<ServiceResult<undefined>>;
  updateMileage(
    vehicleId: Uuid,
    mileage: number,
    recordedAt?: Date,
  ): Promise<ServiceResult<Vehicle>>;
  archiveVehicle(vehicleId: Uuid): Promise<ServiceResult<Vehicle>>;
}
