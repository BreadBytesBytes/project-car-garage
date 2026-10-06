import { Screen, tokens } from '@project-car-garage/ui';
import type { Vehicle } from '@project-car-garage/domain';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import { supabase } from '../../lib/supabase';
import { SupabaseVehicleService } from '../../services/vehicles';

export default function VehicleOverviewScreen() {
  const { vehicleId } = useLocalSearchParams<{ vehicleId: string }>();
  const [error, setError] = useState<string | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    if (!supabase || !vehicleId) return;
    let active = true;
    void new SupabaseVehicleService(supabase)
      .getVehicle(vehicleId as Vehicle['id'])
      .then((result) => {
        if (!active) return;
        if (result.ok) setVehicle(result.data);
        else setError(result.error.message);
      })
      .catch(() => {
        if (active) setError('Unable to load the vehicle. Try again.');
      });
    return () => {
      active = false;
    };
  }, [vehicleId]);

  if (error) {
    return (
      <Screen>
        <Text style={styles.error}>{error}</Text>
      </Screen>
    );
  }
  if (!vehicle) {
    return (
      <Screen>
        <ActivityIndicator accessibilityLabel="Loading vehicle" size="large" />
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.title}>
        {vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
      </Text>
      {vehicle.nickname ? (
        <Text style={styles.identity}>
          {vehicle.year} {vehicle.make} {vehicle.model}
        </Text>
      ) : null}
      <Text style={styles.mileage}>
        {vehicle.currentMileage.toLocaleString()} {vehicle.mileageUnit}
      </Text>
      <Text style={styles.body}>
        Vehicle saved. Detailed overview sections arrive later in Phase 1.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    color: tokens.colors.muted,
    fontSize: 16,
    marginTop: 24,
    textAlign: 'center',
  },
  error: { color: '#b91c1c', fontSize: 16 },
  identity: { color: tokens.colors.muted, fontSize: 18, marginTop: 6 },
  mileage: {
    color: tokens.colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  title: {
    color: tokens.colors.text,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
});
