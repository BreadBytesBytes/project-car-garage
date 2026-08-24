import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  signInWithPassword,
  signOut,
  signUpWithPassword,
} from '../apps/mobile/src/services/auth.ts';

test('auth service normalizes email and delegates password operations', async () => {
  const calls = [];
  const client = {
    auth: {
      signInWithPassword: async (input) => {
        calls.push(['signIn', input]);
        return { data: {}, error: null };
      },
      signOut: async () => {
        calls.push(['signOut']);
        return { error: null };
      },
      signUp: async (input) => {
        calls.push(['signUp', input]);
        return { data: {}, error: null };
      },
    },
  };

  await signUpWithPassword(
    client,
    ' Owner@Example.COM ',
    'secret123',
    'America/La_Paz',
  );
  await signInWithPassword(client, ' Owner@Example.COM ', 'secret123');
  await signOut(client);

  assert.deepEqual(calls, [
    [
      'signUp',
      {
        email: 'owner@example.com',
        password: 'secret123',
        options: { data: { time_zone: 'America/La_Paz' } },
      },
    ],
    ['signIn', { email: 'owner@example.com', password: 'secret123' }],
    ['signOut'],
  ]);
});

test('Expo Router protects authenticated and unauthenticated screens', async () => {
  const layout = await readFile(
    new URL('../apps/mobile/src/app/_layout.tsx', import.meta.url),
    'utf8',
  );

  assert.match(layout, /<Stack\.Protected guard={!session}>/);
  assert.match(layout, /<Stack\.Protected guard={Boolean\(session\)}>/);
  assert.match(layout, /<Stack\.Screen name="sign-in"/);
  assert.match(layout, /<Stack\.Screen name="index"/);
});
