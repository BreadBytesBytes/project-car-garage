import * as Linking from 'expo-linking';
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
} from 'react-native';

import { supabase } from '../lib/supabase';
import {
  requestPasswordReset,
  resendSignupConfirmation,
} from '../services/auth';

type RequestType = 'confirmation' | 'password';

export default function RecoverAccountScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<RequestType | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function send(type: RequestType) {
    if (!supabase || !email.trim()) {
      setError('Enter your email address.');
      return;
    }

    setError(null);
    setMessage(null);
    setLoading(type);

    try {
      if (type === 'password') {
        await requestPasswordReset(
          supabase,
          email,
          Linking.createURL('reset-password'),
        );
        setMessage(
          'If an account matches that email, check your inbox for a password reset link.',
        );
      } else {
        await resendSignupConfirmation(
          supabase,
          email,
          Linking.createURL('sign-in'),
        );
        setMessage(
          'If that account still needs confirmation, check your inbox for a new link.',
        );
      }
    } catch {
      setMessage(
        'If the account is eligible, an email will arrive. Wait a few minutes before trying again.',
      );
    } finally {
      setLoading(null);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Text style={styles.title}>Recover your account</Text>
      <Text style={styles.body}>
        Enter your email to reset your password or resend account confirmation.
      </Text>
      <TextInput
        accessibilityLabel="Email"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        onChangeText={setEmail}
        placeholder="Email"
        style={styles.input}
        value={email}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: Boolean(loading) }}
        disabled={Boolean(loading)}
        onPress={() => void send('password')}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        {loading === 'password' ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Send password reset</Text>
        )}
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: Boolean(loading) }}
        disabled={Boolean(loading)}
        onPress={() => void send('confirmation')}
        style={({ pressed }) => [
          styles.secondaryButton,
          pressed && styles.pressed,
        ]}
      >
        {loading === 'confirmation' ? (
          <ActivityIndicator />
        ) : (
          <Text>Resend confirmation email</Text>
        )}
      </Pressable>

      <Text style={styles.help}>
        Forgot your email? For privacy, accounts cannot be looked up here. Check
        a device where you are already signed in or search your inbox for
        Project Car Garage messages.
      </Text>
      <Pressable
        accessibilityRole="button"
        disabled={Boolean(loading)}
        onPress={() => router.replace('/sign-in')}
        style={({ pressed }) => [
          styles.secondaryButton,
          pressed && styles.pressed,
        ]}
      >
        <Text>Back to sign in</Text>
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
  help: {
    color: '#4b5563',
    marginTop: 20,
    textAlign: 'center',
  },
  input: {
    borderColor: '#9ca3af',
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: 12,
    padding: 14,
  },
  message: {
    color: '#166534',
    marginBottom: 12,
  },
  pressed: {
    opacity: 0.75,
  },
  secondaryButton: {
    alignItems: 'center',
    minHeight: 48,
    padding: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
});
