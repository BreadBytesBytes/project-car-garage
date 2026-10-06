import assert from 'node:assert/strict';
import test from 'node:test';

import { SupabaseVehicleService } from '../apps/mobile/src/services/vehicles.ts';

const vehicleRow = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  garage_id: '11111111-1111-4111-8111-111111111111',
  year: 1992,
  make: 'Nissan',
  model: '240SX',
  trim: null,
  nickname: 'S13',
  vin: null,
  configuration_state: 'swapped',
  current_mileage: 150000,
  mileage_unit: 'mi',
  notes: null,
  archived_at: null,
  created_at: '2026-10-06T20:00:00.000Z',
  updated_at: '2026-10-06T20:00:00.000Z',
};

test('VehicleService validates input and maps create results', async () => {
  const calls = [];
  const service = new SupabaseVehicleService({
    rpc: async (name, input) => {
      calls.push({ name, input });
      return { data: vehicleRow, error: null };
    },
  });

  const invalid = await service.createVehicle({
    year: 1992,
    make: '',
    model: '240SX',
    configurationState: 'swapped',
    mileage: 150000,
    mileageUnit: 'mi',
    usageModes: ['street'],
  });
  assert.equal(invalid.ok, false);
  assert.equal(calls.length, 0);

  const result = await service.createVehicle({
    year: 1992,
    make: 'Nissan',
    model: '240SX',
    configurationState: 'swapped',
    mileage: 150000,
    mileageUnit: 'mi',
    usageModes: ['street', 'track'],
    primaryUsageMode: 'street',
    nickname: 'S13',
    components: [
      { componentType: 'chassis', origin: 'original', model: 'S13' },
      { componentType: 'engine', origin: 'swapped', model: 'M50' },
    ],
  });

  assert.equal(result.ok, true);
  assert.equal(result.data.garageId, vehicleRow.garage_id);
  assert.equal(result.data.currentMileage, 150000);
  assert.equal(calls[0].name, 'onboard_vehicle');
  assert.deepEqual(calls[0].input.vehicle_usage_modes, ['street', 'track']);
  assert.equal(calls[0].input.replacement_components[1].model, 'M50');
});

test('VehicleService rejects bad mileage before calling the database', async () => {
  let called = false;
  const service = new SupabaseVehicleService({
    rpc: async () => {
      called = true;
      return { data: vehicleRow, error: null };
    },
  });

  const result = await service.updateMileage(vehicleRow.id, -1);
  assert.equal(result.ok, false);
  assert.equal(result.error.field, 'mileage');
  assert.equal(called, false);
});
