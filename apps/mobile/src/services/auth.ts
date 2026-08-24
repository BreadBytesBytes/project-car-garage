import type { SupabaseClient } from '@supabase/supabase-js';

type AuthClient = Pick<SupabaseClient, 'auth'>;

export function signUpWithPassword(
  client: AuthClient,
  email: string,
  password: string,
  timeZone: string,
) {
  return client.auth.signUp({
    email: email.trim().toLowerCase(),
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
    email: email.trim().toLowerCase(),
    password,
  });
}

export function signOut(client: AuthClient) {
  return client.auth.signOut();
}
