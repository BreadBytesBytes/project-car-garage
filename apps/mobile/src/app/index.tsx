import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../lib/supabase';
import { signOut } from '../services/auth';

export default function HomeScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [error, setError] = useState<string | null>(null);

  async function handleSignOut() {
    if (!supabase) return;
    const result = await signOut(supabase);
    if (result.error) setError(result.error.message);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Project Car Garage</Text>
      <Text>Signed in as {session?.user.email}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('./account')}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.buttonText}>Account settings</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={() => void handleSignOut()}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.buttonText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#111827',
    borderRadius: 8,
    marginTop: 24,
    minHeight: 48,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  error: {
    color: '#b91c1c',
    marginTop: 12,
  },
  pressed: {
    opacity: 0.75,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
});
