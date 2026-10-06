import { Stack } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AuthProvider, useAuth } from '../auth/AuthProvider';
import { FeatureFlagProvider } from '../features/FeatureFlagProvider';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <FeatureFlagProvider>
        <RootNavigator />
      </FeatureFlagProvider>
    </AuthProvider>
  );
}

function RootNavigator() {
  const { loading, session } = useAuth();

  if (loading) {
    return (
      <View accessibilityLabel="Loading account" style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="recover-account" />
      </Stack.Protected>
      <Stack.Protected guard={Boolean(session)}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="account"
          options={{ headerShown: true, title: 'Account' }}
        />
        <Stack.Screen
          name="quick-add"
          options={{
            headerShown: true,
            presentation: 'modal',
            title: 'Quick Add',
          }}
        />
        <Stack.Screen
          name="developer"
          options={{ headerShown: true, title: 'Developer' }}
        />
        <Stack.Screen
          name="vehicles/new"
          options={{ headerShown: true, title: 'Add Vehicle' }}
        />
        <Stack.Screen
          name="vehicles/[vehicleId]"
          options={{ headerShown: true, title: 'Vehicle Overview' }}
        />
      </Stack.Protected>
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
