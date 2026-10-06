import type { SupabaseClient } from '@supabase/supabase-js';

type AuthClient = Pick<SupabaseClient, 'auth'>;

type RecoverySession = {
  access_token: string;
  refresh_token: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function signUpWithPassword(
  client: AuthClient,
  email: string,
  password: string,
  timeZone: string,
) {
  return client.auth.signUp({
    email: normalizeEmail(email),
    password,
    options: { data: { time_zone: timeZone } },
  });
}

export function signInWithPassword(
  client: AuthClient,
  email: string,
  password: string,
) {
  return client.auth.signInWithPassword({
    email: normalizeEmail(email),
    password,
  });
}

export function requestPasswordReset(
  client: AuthClient,
  email: string,
  redirectTo: string,
) {
  return client.auth.resetPasswordForEmail(normalizeEmail(email), {
    redirectTo,
  });
}

export function resendSignupConfirmation(
  client: AuthClient,
  email: string,
  emailRedirectTo: string,
) {
  return client.auth.resend({
    type: 'signup',
    email: normalizeEmail(email),
    options: { emailRedirectTo },
  });
}

export function updateEmail(
  client: AuthClient,
  email: string,
  emailRedirectTo: string,
) {
  return client.auth.updateUser(
    { email: normalizeEmail(email) },
    { emailRedirectTo },
  );
}

export function updatePassword(
  client: AuthClient,
  currentPassword: string,
  password: string,
) {
  return client.auth.updateUser({
    current_password: currentPassword,
    password,
  });
}

export function setRecoveredPassword(client: AuthClient, password: string) {
  return client.auth.updateUser({ password });
}

export function parseRecoverySession(url: string): RecoverySession | null {
  try {
    const parsed = new URL(url);
    const hash = new URLSearchParams(parsed.hash.slice(1));
    const params = hash.has('type') ? hash : parsed.searchParams;
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (params.get('type') !== 'recovery' || !accessToken || !refreshToken) {
      return null;
    }

    return { access_token: accessToken, refresh_token: refreshToken };
  } catch {
    return null;
  }
}

export function signOut(client: AuthClient) {
  return client.auth.signOut();
}
