import { useState } from 'react';
import { useRouter } from 'expo-router';
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
import { signInWithPassword, signUpWithPassword } from '../services/auth';

export default function SignInScreen() {
  const router = useRouter();
  const { configured } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [password, setPassword] = useState('');

  async function submit() {
    if (!supabase || !email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }

    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const result = isSignUp
        ? await signUpWithPassword(
            supabase,
            email,
            password,
            Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
          )
        : await signInWithPassword(supabase, email, password);

      if (result.error) setError(result.error.message);
      else if (isSignUp && !result.data.session) {
        setMessage('Check your email to confirm your account, then sign in.');
      }
    } catch {
      setError('Unable to reach the authentication service. Try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!configured) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Supabase setup required</Text>
        <Text style={styles.body}>
          Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
          to your local .env file, then restart Expo.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Text style={styles.title}>Project Car Garage</Text>
      <Text style={styles.body}>
        {isSignUp ? 'Create your account' : 'Sign in to your garage'}
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
      <TextInput
        accessibilityLabel="Password"
        autoCapitalize="none"
        autoComplete={isSignUp ? 'new-password' : 'current-password'}
        onChangeText={setPassword}
        onSubmitEditing={() => void submit()}
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: loading }}
        disabled={loading}
        onPress={() => void submit()}
        style={({ pressed }) => [
          styles.primaryButton,
          pressed && styles.pressed,
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.primaryButtonText}>
            {isSignUp ? 'Create account' : 'Sign in'}
          </Text>
        )}
      </Pressable>

      <Pressable
        accessibilityRole="button"
        disabled={loading}
        onPress={() => {
          setError(null);
          setMessage(null);
          setIsSignUp((value) => !value);
        }}
        style={({ pressed }) => [
          styles.secondaryButton,
          pressed && styles.pressed,
        ]}
      >
        <Text>
          {isSignUp
            ? 'Already have an account? Sign in'
            : 'Need an account? Sign up'}
        </Text>
      </Pressable>

      {!isSignUp ? (
        <Pressable
          accessibilityRole="button"
          disabled={loading}
          onPress={() => router.push('./recover-account')}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.pressed,
          ]}
        >
          <Text>Forgot password or need a new confirmation email?</Text>
        </Pressable>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  body: {
    color: '#4b5563',
    marginBottom: 24,
    textAlign: 'center',
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
  message: {
    color: '#166534',
    marginBottom: 12,
  },
  pressed: {
    opacity: 0.75,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 8,
    minHeight: 48,
    padding: 14,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
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
