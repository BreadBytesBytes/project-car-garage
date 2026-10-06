import {
  Button,
  ButtonText,
  EmptyState,
  Screen,
  tokens,
} from '@project-car-garage/ui';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../../auth/AuthProvider';
import { supabase } from '../../lib/supabase';
import { signOut } from '../../services/auth';

export default function MoreScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [error, setError] = useState<string | null>(null);

  async function handleSignOut() {
    if (!supabase) return;
    const result = await signOut(supabase);
    if (result.error) setError(result.error.message);
  }

  return (
    <Screen>
      <View style={styles.content}>
        <Text style={styles.email}>Signed in as {session?.user.email}</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          accessibilityLabel="Open account settings"
          onPress={() => router.push('/account')}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <ButtonText style={styles.buttonText}>Account settings</ButtonText>
        </Button>
        <Button
          accessibilityLabel="Sign out"
          onPress={() => void handleSignOut()}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.pressed,
          ]}
        >
          <ButtonText style={styles.secondaryButtonText}>Sign out</ButtonText>
        </Button>
        <EmptyState
          body="Garage Inbox, search, references, knowledge, archives, and additional settings will appear here as they are built."
          title="More garage tools are coming"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: tokens.colors.text,
    borderRadius: tokens.radius,
    justifyContent: 'center',
    marginBottom: 12,
    minHeight: 48,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  content: {
    maxWidth: 480,
    width: '100%',
  },
  email: {
    color: tokens.colors.muted,
    marginBottom: 16,
    textAlign: 'center',
  },
  error: {
    color: '#b91c1c',
    marginBottom: 12,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius,
    borderWidth: 1,
    justifyContent: 'center',
    marginBottom: 24,
    minHeight: 48,
  },
  secondaryButtonText: {
    color: tokens.colors.text,
    fontWeight: '700',
  },
});
