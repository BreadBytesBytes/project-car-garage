import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  parseRecoverySession,
  requestPasswordReset,
  resendSignupConfirmation,
  setRecoveredPassword,
  signInWithPassword,
  signOut,
  signUpWithPassword,
  updateEmail,
  updatePassword,
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

test('auth service delegates recovery and credential updates safely', async () => {
  const calls = [];
  const client = {
    auth: {
      resend: async (input) => calls.push(['resend', input]),
      resetPasswordForEmail: async (...input) =>
        calls.push(['resetPasswordForEmail', ...input]),
      updateUser: async (...input) => calls.push(['updateUser', ...input]),
    },
  };

  await requestPasswordReset(
    client,
    ' Owner@Example.COM ',
    'project-car-garage://reset-password',
  );
  await resendSignupConfirmation(
    client,
    ' Owner@Example.COM ',
    'project-car-garage://sign-in',
  );
  await updateEmail(
    client,
    ' New@Example.COM ',
    'project-car-garage://account',
  );
  await updatePassword(client, 'old-secret', 'new-secret');
  await setRecoveredPassword(client, 'recovered-secret');

  assert.deepEqual(calls, [
    [
      'resetPasswordForEmail',
      'owner@example.com',
      { redirectTo: 'project-car-garage://reset-password' },
    ],
    [
      'resend',
      {
        type: 'signup',
        email: 'owner@example.com',
        options: { emailRedirectTo: 'project-car-garage://sign-in' },
      },
    ],
    [
      'updateUser',
      { email: 'new@example.com' },
      { emailRedirectTo: 'project-car-garage://account' },
    ],
    ['updateUser', { current_password: 'old-secret', password: 'new-secret' }],
    ['updateUser', { password: 'recovered-secret' }],
  ]);
});

test('recovery links accept complete recovery tokens only', () => {
  const expected = {
    access_token: 'access-token',
    refresh_token: 'refresh-token',
  };

  assert.deepEqual(
    parseRecoverySession(
      'project-car-garage://reset-password#type=recovery&access_token=access-token&refresh_token=refresh-token',
    ),
    expected,
  );
  assert.deepEqual(
    parseRecoverySession(
      'project-car-garage://reset-password?type=recovery&access_token=access-token&refresh_token=refresh-token',
    ),
    expected,
  );
  assert.equal(
    parseRecoverySession(
      'project-car-garage://reset-password#type=signup&access_token=access-token&refresh_token=refresh-token',
    ),
    null,
  );
  assert.equal(
    parseRecoverySession(
      'project-car-garage://reset-password#type=recovery&access_token=access-token',
    ),
    null,
  );
  assert.equal(parseRecoverySession('not a valid URL'), null);
});

test('Expo Router protects authenticated and unauthenticated screens', async () => {
  const layout = await readFile(
    new URL('../apps/mobile/src/app/_layout.tsx', import.meta.url),
    'utf8',
  );

  assert.match(layout, /<Stack\.Protected guard={!session}>/);
  assert.match(layout, /<Stack\.Protected guard={Boolean\(session\)}>/);
  assert.match(layout, /<Stack\.Screen name="sign-in"/);
  assert.match(layout, /<Stack\.Screen name="recover-account"/);
  assert.match(layout, /<Stack\.Screen name="reset-password"/);
  assert.match(layout, /<Stack\.Screen name="\(tabs\)"/);
  assert.match(layout, /<Stack\.Screen\s+name="account"/);
  assert.match(layout, /<Stack\.Screen[\s\S]*name="quick-add"/);
  assert.ok(
    layout.indexOf('<Stack.Screen name="sign-in"') <
      layout.indexOf('<Stack.Screen name="reset-password"'),
  );
});

test('signed-out recovery messages do not reveal account existence', async () => {
  const [accountScreen, screen, resetScreen] = await Promise.all([
    readFile(
      new URL('../apps/mobile/src/app/account.tsx', import.meta.url),
      'utf8',
    ),
    readFile(
      new URL('../apps/mobile/src/app/recover-account.tsx', import.meta.url),
      'utf8',
    ),
    readFile(
      new URL('../apps/mobile/src/app/reset-password.tsx', import.meta.url),
      'utf8',
    ),
  ]);

  assert.match(screen, /If an account matches that email/);
  assert.match(screen, /If that account still needs confirmation/);
  assert.doesNotMatch(screen, /router\.back/);
  assert.doesNotMatch(accountScreen, /router\.(back|replace)/);
  assert.match(resetScreen, /if \(!session \|\| !recovering\)/);
});
