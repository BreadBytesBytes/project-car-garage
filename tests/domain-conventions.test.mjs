import assert from 'node:assert/strict';
import test from 'node:test';

import {
  isValidTimeZone,
  parseUtcTimestamp,
  parseUuid,
  serviceFailure,
  serviceSuccess,
  toUtcTimestamp,
} from '../packages/domain/src/index.ts';

test('service results distinguish success from expected failure', () => {
  assert.deepEqual(serviceSuccess({ id: 1 }), {
    ok: true,
    data: { id: 1 },
  });
  assert.deepEqual(
    serviceFailure('VALIDATION', 'Mileage is required.', 'mileage'),
    {
      ok: false,
      error: {
        code: 'VALIDATION',
        message: 'Mileage is required.',
        field: 'mileage',
      },
    },
  );
});

test('UUID validation accepts domain IDs and identifies the field on failure', () => {
  const valid = parseUuid(' 550e8400-e29b-41d4-a716-446655440000 ');
  const invalid = parseUuid('not-a-uuid', 'vehicleId');

  assert.deepEqual(valid, {
    ok: true,
    data: '550e8400-e29b-41d4-a716-446655440000',
  });
  assert.deepEqual(invalid, {
    ok: false,
    error: {
      code: 'VALIDATION',
      message: 'Enter a valid UUID.',
      field: 'vehicleId',
    },
  });
});

test('timestamps normalize UTC and reject offsets, impossible dates, and bad Date objects', () => {
  assert.deepEqual(parseUtcTimestamp('2026-08-22T22:00:32+00:00'), {
    ok: true,
    data: '2026-08-22T22:00:32.000Z',
  });
  assert.equal(parseUtcTimestamp('2026-08-22T18:00:32-04:00').ok, false);
  assert.equal(parseUtcTimestamp('2026-02-30T12:00:00Z').ok, false);
  assert.deepEqual(toUtcTimestamp(new Date('2026-08-22T22:00:32Z')), {
    ok: true,
    data: '2026-08-22T22:00:32.000Z',
  });
  assert.equal(toUtcTimestamp(new Date('invalid')).ok, false);
});

test('time zones use the platform IANA implementation', () => {
  assert.equal(isValidTimeZone('America/La_Paz'), true);
  assert.equal(isValidTimeZone('Not/A_Time_Zone'), false);
  assert.equal(isValidTimeZone(''), false);
});
