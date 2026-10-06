import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('VIN onboarding preserves editable identity fields and manual fallback', async () => {
  const onboarding = await readFile(
    new URL('apps/mobile/src/app/vehicles/new.tsx', root),
    'utf8',
  );

  assert.match(onboarding, /decodeVin\(/);
  assert.match(onboarding, /value: 'manual'/);
  assert.match(onboarding, /value: 'vin'/);
  assert.match(onboarding, /setYear\(/);
  assert.match(onboarding, /setMake\(/);
  assert.match(onboarding, /setModel\(/);
  assert.match(onboarding, /label="Trim \(optional\)"/);
  assert.match(onboarding, /decodedVin \?\? undefined/);
  assert.match(onboarding, /You can keep entering details manually/);
});
