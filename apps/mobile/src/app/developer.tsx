import { tokens } from '@project-car-garage/ui';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { useFeatureFlags } from '../features/FeatureFlagProvider';
import { featureFlagKeys, type FeatureFlagKey } from '../features/featureFlags';

const descriptions: Record<FeatureFlagKey, { label: string; detail: string }> =
  {
    ai: {
      label: 'AI features',
      detail: 'Optional AI surfaces. Core workflows remain available when off.',
    },
    nativeShare: {
      label: 'Native share',
      detail: 'Experimental receive-from-share-sheet entry points.',
    },
    knowledge: {
      label: 'Knowledge',
      detail: 'Experimental knowledge placeholders and navigation.',
    },
    debugScoring: {
      label: 'Debug scoring',
      detail: 'Private recommendation scoring details for development.',
    },
  };

export default function DeveloperScreen() {
  const { flags, setFlag } = useFeatureFlags();

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.heading}>Experimental features</Text>
      <Text style={styles.note}>
        These controls affect this app session only and reset when the app
        restarts. They control visibility, not server-side authorization.
      </Text>
      {featureFlagKeys.map((key) => {
        const description = descriptions[key];
        return (
          <View key={key} style={styles.row}>
            <View style={styles.copy}>
              <Text style={styles.label}>{description.label}</Text>
              <Text style={styles.detail}>{description.detail}</Text>
              <Text style={styles.status}>
                {flags[key] ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
            <Switch
              accessibilityLabel={`Toggle ${description.label}`}
              onValueChange={(enabled) => setFlag(key, enabled)}
              trackColor={{ true: tokens.colors.accent }}
              value={flags[key]}
            />
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  copy: {
    flex: 1,
    paddingRight: 16,
  },
  detail: {
    color: tokens.colors.muted,
    lineHeight: 20,
    marginTop: 4,
  },
  heading: {
    color: tokens.colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  label: {
    color: tokens.colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  note: {
    color: tokens.colors.muted,
    lineHeight: 22,
    marginBottom: 24,
    marginTop: 8,
  },
  row: {
    alignItems: 'center',
    backgroundColor: tokens.colors.surface,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 12,
    minHeight: 96,
    padding: 16,
  },
  screen: {
    backgroundColor: tokens.colors.background,
    flexGrow: 1,
    padding: 24,
  },
  status: {
    color: tokens.colors.text,
    fontWeight: '600',
    marginTop: 8,
  },
});
