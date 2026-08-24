import type { Session } from '@supabase/supabase-js';
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

type AuthState = {
  configured: boolean;
  loading: boolean;
  session: Session | null;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    let mounted = true;
    void client.auth
      .getSession()
      .then(({ data }) => {
        if (mounted) setSession(data.session);
      })
      .catch(() => undefined)
      .finally(() => {
        if (mounted) setLoading(false);
      });

    const { data: authListener } = client.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
        setLoading(false);
      },
    );

    const appStateListener = AppState.addEventListener('change', (state) => {
      if (state === 'active') void client.auth.startAutoRefresh();
      else void client.auth.stopAutoRefresh();
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
      appStateListener.remove();
    };
  }, []);

  const value = useMemo(
    () => ({ configured: isSupabaseConfigured, loading, session }),
    [loading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
