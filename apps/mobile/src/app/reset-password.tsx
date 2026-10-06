import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../lib/supabase';
import { setRecoveredPassword, signOut } from '../services/auth';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { recovering, session } = useAuth();
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');

  async function submit() {
    if (!supabase || !password) {
      setError('Enter a new password.');
      return;
    }
    if (password !== confirmation) {
      setError('Passwords do not match.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const result = await setRecoveredPassword(supabase, password);
      if (result.error) {
        setError(result.error.message);
        return;
      }

      const signedOut = await signOut(supabase);
      if (signedOut.error) {
        setError(
          'Password updated, but sign out failed. Try signing out again.',
        );
        return;
      }
      router.replace('/sign-in');
    } catch {
      setError('Unable to update your password. Try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!session || !recovering) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Reset link unavailable</Text>
        <Text style={styles.body}>
          This password reset link is invalid or expired. Request a new one.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('./recover-account')}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonText}>Request another link</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Text style={styles.title}>Choose a new password</Text>
      <Text style={styles.body}>
        After updating it, sign in again with your new password.
      </Text>
      <TextInput
        accessibilityLabel="New password"
        autoCapitalize="none"
        autoComplete="new-password"
        onChangeText={setPassword}
        placeholder="New password"
        secureTextEntry
        style={styles.input}
        value={password}
      />
      <TextInput
        accessibilityLabel="Confirm new password"
        autoCapitalize="none"
        autoComplete="new-password"
        onChangeText={setConfirmation}
        onSubmitEditing={() => void submit()}
        placeholder="Confirm new password"
        secureTextEntry
        style={styles.input}
        value={confirmation}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: loading }}
        disabled={loading}
        onPress={() => void submit()}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Update password</Text>
        )}
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  body: {
    color: '#4b5563',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 8,
    minHeight: 48,
    padding: 14,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  error: {
    color: '#b91c1c',
    marginBottom: 12,
  },
  input: {
    borderColor: '#9ca3af',
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: 12,
    padding: 14,
  },
  pressed: {
    opacity: 0.75,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
});
