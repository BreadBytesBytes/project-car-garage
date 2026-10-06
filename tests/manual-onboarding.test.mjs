import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('manual onboarding reaches a protected vehicle overview', async () => {
  const [garage, layout, onboarding, overview] = await Promise.all([
    readFile(new URL('apps/mobile/src/app/(tabs)/index.tsx', root), 'utf8'),
    readFile(new URL('apps/mobile/src/app/_layout.tsx', root), 'utf8'),
    readFile(new URL('apps/mobile/src/app/vehicles/new.tsx', root), 'utf8'),
    readFile(
      new URL('apps/mobile/src/app/vehicles/[vehicleId].tsx', root),
      'utf8',
    ),
  ]);

  assert.match(garage, /router\.push\('\/vehicles\/new'\)/);
  assert.match(layout, /name="vehicles\/new"/);
  assert.match(layout, /name="vehicles\/\[vehicleId\]"/);
  assert.match(onboarding, /configurationState === 'swapped'/);
  assert.match(onboarding, /componentType: 'chassis'/);
  assert.match(onboarding, /componentType: 'engine'/);
  assert.match(onboarding, /\.createVehicle\(/);
  assert.match(onboarding, /pathname: '\/vehicles\/\[vehicleId\]'/);
  assert.match(overview, /\.getVehicle\(/);
});
