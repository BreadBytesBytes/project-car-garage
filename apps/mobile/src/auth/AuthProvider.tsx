import type { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AppState } from 'react-native';

import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { parseRecoverySession } from '../services/auth';

type AuthState = {
  configured: boolean;
  loading: boolean;
  recovering: boolean;
  session: Session | null;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [recovering, setRecovering] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    let mounted = true;
    void Linking.getInitialURL()
      .then(async (url) => {
        const recovery = url ? parseRecoverySession(url) : null;
        const result = recovery
          ? await client.auth.setSession(recovery)
          : await client.auth.getSession();
        if (mounted) {
          setRecovering(Boolean(recovery && !result.error));
          setSession(result.data.session);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (mounted) setLoading(false);
      });

    const { data: authListener } = client.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (!nextSession) setRecovering(false);
        setSession(nextSession);
        setLoading(false);
      },
    );

    const appStateListener = AppState.addEventListener('change', (state) => {
      if (state === 'active') void client.auth.startAutoRefresh();
      else void client.auth.stopAutoRefresh();
    });

    const linkListener = Linking.addEventListener('url', ({ url }) => {
      const recovery = parseRecoverySession(url);
      if (recovery) {
        void client.auth
          .setSession(recovery)
          .then(({ error }) => {
            if (!error) setRecovering(true);
          })
          .catch(() => undefined);
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
      appStateListener.remove();
      linkListener.remove();
    };
  }, []);

  const value = useMemo(
    () => ({ configured: isSupabaseConfigured, loading, recovering, session }),
    [loading, recovering, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
