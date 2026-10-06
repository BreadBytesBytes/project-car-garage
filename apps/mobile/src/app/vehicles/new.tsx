import { Button, ButtonText, tokens } from '@project-car-garage/ui';
import type {
  AddModificationInput,
  ReplacementComponentInput,
  VehicleConfigurationState,
  VehicleUsageMode,
} from '@project-car-garage/domain';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { supabase } from '../../lib/supabase';
import { SupabaseVehicleService } from '../../services/vehicles';

const configurationOptions: readonly {
  label: string;
  value: VehicleConfigurationState;
}[] = [
  { label: 'Mostly stock', value: 'stock' },
  { label: 'Modified', value: 'modified' },
  { label: 'Heavily modified / swapped', value: 'swapped' },
];

const usageOptions: readonly { label: string; value: VehicleUsageMode }[] = [
  { label: 'Street', value: 'street' },
  { label: 'Track', value: 'track' },
  { label: 'Autocross', value: 'autocross' },
  { label: 'Drag', value: 'drag' },
  { label: 'Rally', value: 'rally' },
  { label: 'Off-road', value: 'off_road' },
  { label: 'Show', value: 'show' },
  { label: 'Storage', value: 'storage' },
];

export default function NewVehicleScreen() {
  const router = useRouter();
  const [configurationState, setConfigurationState] =
    useState<VehicleConfigurationState>('stock');
  const [engine, setEngine] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [make, setMake] = useState('');
  const [mileage, setMileage] = useState('');
  const [mileageUnit, setMileageUnit] = useState<'mi' | 'km'>('mi');
  const [model, setModel] = useState('');
  const [modification, setModification] = useState('');
  const [nickname, setNickname] = useState('');
  const [chassis, setChassis] = useState('');
  const [transmission, setTransmission] = useState('');
  const [usageModes, setUsageModes] = useState<VehicleUsageMode[]>(['street']);
  const [year, setYear] = useState('');

  function toggleUsage(mode: VehicleUsageMode) {
    setUsageModes((current) =>
      current.includes(mode)
        ? current.filter((value) => value !== mode)
        : [...current, mode],
    );
  }

  async function submit() {
    if (!supabase || !year || !make.trim() || !model.trim() || !mileage) {
      setError('Year, make, model, and mileage are required.');
      return;
    }
    if (
      configurationState === 'swapped' &&
      (!chassis.trim() || !engine.trim())
    ) {
      setError('Add the current chassis and engine for a swapped vehicle.');
      return;
    }

    const components: ReplacementComponentInput[] = [];
    if (configurationState === 'swapped') {
      components.push(
        { componentType: 'chassis', origin: 'original', model: chassis },
        { componentType: 'engine', origin: 'swapped', model: engine },
      );
      if (transmission.trim()) {
        components.push({
          componentType: 'transmission',
          origin: 'user_entered',
          model: transmission,
        });
      }
    }

    const modifications: AddModificationInput[] = modification.trim()
      ? [{ category: 'general', name: modification }]
      : [];

    setError(null);
    setLoading(true);
    try {
      const result = await new SupabaseVehicleService(supabase).createVehicle({
        year: Number(year),
        make,
        model,
        nickname,
        configurationState,
        mileage: Number(mileage),
        mileageUnit,
        usageModes,
        primaryUsageMode: usageModes[0],
        components,
        modifications,
      });

      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      router.replace({
        pathname: '/vehicles/[vehicleId]',
        params: { vehicleId: result.data.id },
      });
    } catch {
      setError('Unable to save the vehicle. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>Tell us about the car</Text>
        <Text style={styles.body}>
          Start simple. You can fill in more later.
        </Text>

        <Field
          label="Year"
          onChangeText={setYear}
          value={year}
          keyboardType="number-pad"
        />
        <Field label="Make" onChangeText={setMake} value={make} />
        <Field label="Model" onChangeText={setModel} value={model} />
        <Field
          label="Nickname (optional)"
          onChangeText={setNickname}
          value={nickname}
        />
        <Field
          label="Current mileage"
          onChangeText={setMileage}
          value={mileage}
          keyboardType="number-pad"
        />

        <Text style={styles.label}>Mileage unit</Text>
        <ChoiceRow
          options={[
            { label: 'Miles', value: 'mi' },
            { label: 'Kilometers', value: 'km' },
          ]}
          selected={[mileageUnit]}
          onPress={(value) => setMileageUnit(value as 'mi' | 'km')}
        />

        <Text style={styles.label}>Current configuration</Text>
        <ChoiceRow
          options={configurationOptions}
          selected={[configurationState]}
          onPress={(value) =>
            setConfigurationState(value as VehicleConfigurationState)
          }
        />

        {configurationState === 'swapped' ? (
          <View style={styles.advanced}>
            <Text style={styles.sectionTitle}>Current major components</Text>
            <Field label="Chassis" onChangeText={setChassis} value={chassis} />
            <Field label="Engine" onChangeText={setEngine} value={engine} />
            <Field
              label="Transmission (optional)"
              onChangeText={setTransmission}
              value={transmission}
            />
          </View>
        ) : null}

        {configurationState !== 'stock' ? (
          <Field
            label="Major modification (optional)"
            onChangeText={setModification}
            value={modification}
          />
        ) : null}

        <Text style={styles.label}>Usage (choose one or more)</Text>
        <ChoiceRow
          options={usageOptions}
          selected={usageModes}
          onPress={(value) => toggleUsage(value as VehicleUsageMode)}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          accessibilityLabel="Save vehicle"
          accessibilityState={{ disabled: loading }}
          disabled={loading}
          onPress={() => void submit()}
          style={styles.saveButton}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <ButtonText style={styles.saveText}>Save vehicle</ButtonText>
          )}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput accessibilityLabel={label} style={styles.input} {...props} />
    </View>
  );
}

function ChoiceRow({
  onPress,
  options,
  selected,
}: {
  onPress: (value: string) => void;
  options: readonly { label: string; value: string }[];
  selected: readonly string[];
}) {
  return (
    <View style={styles.choices}>
      {options.map((option) => {
        const active = selected.includes(option.value);
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            key={option.value}
            onPress={() => onPress(option.value)}
            style={[styles.choice, active && styles.choiceActive]}
          >
            <Text
              style={[styles.choiceText, active && styles.choiceTextActive]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  advanced: { marginTop: 8 },
  body: { color: tokens.colors.muted, fontSize: 16, marginBottom: 20 },
  choice: {
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 14,
  },
  choiceActive: {
    backgroundColor: tokens.colors.text,
    borderColor: tokens.colors.text,
  },
  choiceText: { color: tokens.colors.text },
  choiceTextActive: { color: '#ffffff', fontWeight: '700' },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  container: { backgroundColor: tokens.colors.background, flex: 1 },
  content: { alignSelf: 'center', maxWidth: 560, padding: 24, width: '100%' },
  error: { color: '#b91c1c', marginBottom: 12 },
  field: { marginBottom: 16 },
  heading: {
    color: tokens.colors.text,
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    backgroundColor: tokens.colors.surface,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  label: { color: tokens.colors.text, fontWeight: '600', marginBottom: 8 },
  saveButton: {
    alignItems: 'center',
    backgroundColor: tokens.colors.accent,
    borderRadius: tokens.radius,
    minHeight: 50,
    padding: 14,
  },
  saveText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  sectionTitle: {
    color: tokens.colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
});
