import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../lib/supabase';
import { updateEmail, updatePassword } from '../services/auth';

type RequestType = 'email' | 'password';

export default function AccountScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [confirmation, setConfirmation] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<RequestType | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [password, setPassword] = useState('');

  function begin(type: RequestType) {
    setError(null);
    setMessage(null);
    setLoading(type);
  }

  async function changeEmail() {
    if (!supabase || !email.trim()) {
      setError('Enter your new email address.');
      return;
    }
    begin('email');
    try {
      const result = await updateEmail(
        supabase,
        email,
        Linking.createURL('account'),
      );
      if (result.error) setError(result.error.message);
      else {
        setEmail('');
        setMessage('Check your inbox to confirm the email change.');
      }
    } catch {
      setError('Unable to update your email. Try again.');
    } finally {
      setLoading(null);
    }
  }

  async function changePassword() {
    if (!supabase || !currentPassword || !password) {
      setError('Enter your current and new passwords.');
      return;
    }
    if (password !== confirmation) {
      setError('New passwords do not match.');
      return;
    }
    begin('password');
    try {
      const result = await updatePassword(supabase, currentPassword, password);
      if (result.error) setError(result.error.message);
      else {
        setConfirmation('');
        setCurrentPassword('');
        setPassword('');
        setMessage('Password updated.');
      }
    } catch {
      setError('Unable to update your password. Try again.');
    } finally {
      setLoading(null);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.replace('/')}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Text>Back to garage</Text>
      </Pressable>
      <Text style={styles.title}>Account</Text>
      <Text style={styles.body}>Signed in as {session?.user.email}</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Change email</Text>
        <TextInput
          accessibilityLabel="New email"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="New email"
          style={styles.input}
          value={email}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: Boolean(loading) }}
          disabled={Boolean(loading)}
          onPress={() => void changeEmail()}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          {loading === 'email' ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Update email</Text>
          )}
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Change password</Text>
        <TextInput
          accessibilityLabel="Current password"
          autoCapitalize="none"
          autoComplete="current-password"
          onChangeText={setCurrentPassword}
          placeholder="Current password"
          secureTextEntry
          style={styles.input}
          value={currentPassword}
        />
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
          onSubmitEditing={() => void changePassword()}
          placeholder="Confirm new password"
          secureTextEntry
          style={styles.input}
          value={confirmation}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: Boolean(loading) }}
          disabled={Boolean(loading)}
          onPress={() => void changePassword()}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          {loading === 'password' ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Update password</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignSelf: 'flex-start',
    minHeight: 48,
    paddingVertical: 14,
  },
  body: {
    color: '#4b5563',
    marginBottom: 12,
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
    flexGrow: 1,
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
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
});
