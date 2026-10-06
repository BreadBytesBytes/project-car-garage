import assert from 'node:assert/strict';
import test from 'node:test';

import { decodeVin } from '../apps/mobile/src/services/vpic.ts';

function response(body, ok = true) {
  return { ok, json: async () => body };
}

test('vPIC adapter maps successful and partial identity responses', async () => {
  let requestedUrl;
  const complete = await decodeVin(' 1hgcm82633a004352 ', 2003, async (url) => {
    requestedUrl = String(url);
    return response({
      Results: [
        {
          ErrorCode: '0',
          ErrorText: '0 - VIN decoded clean.',
          Make: 'HONDA',
          Model: 'Accord',
          ModelYear: '2003',
          Trim: 'EX-V6',
        },
      ],
    });
  });

  assert.equal(complete.ok, true);
  assert.equal(complete.data.vin, '1HGCM82633A004352');
  assert.equal(complete.data.make, 'HONDA');
  assert.equal(complete.data.warning, null);
  assert.match(requestedUrl, /modelyear=2003/);

  const partial = await decodeVin('5UXWX7C50BL123456', undefined, async () =>
    response({
      Results: [
        {
          ErrorCode: '6',
          ErrorText: 'Incomplete VIN.',
          Make: 'BMW',
          Model: '',
          ModelYear: '2011',
        },
      ],
    }),
  );
  assert.deepEqual(partial, {
    ok: true,
    data: {
      vin: '5UXWX7C50BL123456',
      year: 2011,
      make: 'BMW',
      model: null,
      trim: null,
      warning: 'Incomplete VIN.',
    },
  });
});

test('vPIC adapter handles invalid, missing, and unavailable decodes', async () => {
  let called = false;
  const invalid = await decodeVin('bad vin', undefined, async () => {
    called = true;
    return response({});
  });
  assert.equal(invalid.ok, false);
  assert.equal(invalid.error.code, 'VALIDATION');
  assert.equal(called, false);

  const missing = await decodeVin('1HGCM82633A004352', undefined, async () =>
    response({ Results: [{ ErrorCode: '7', ErrorText: 'VIN not found.' }] }),
  );
  assert.equal(missing.ok, false);
  assert.equal(missing.error.code, 'NOT_FOUND');

  const unavailable = await decodeVin(
    '1HGCM82633A004352',
    undefined,
    async () => {
      throw new Error('offline');
    },
  );
  assert.equal(unavailable.ok, false);
  assert.equal(unavailable.error.code, 'UNAVAILABLE');
});
