export const featureFlagKeys = [
  'ai',
  'nativeShare',
  'knowledge',
  'debugScoring',
] as const;

export type FeatureFlagKey = (typeof featureFlagKeys)[number];
export type FeatureFlags = Readonly<Record<FeatureFlagKey, boolean>>;

export const defaultFeatureFlags: FeatureFlags = Object.freeze({
  ai: false,
  nativeShare: false,
  knowledge: false,
  debugScoring: false,
});

export function isFeatureEnabled(flags: FeatureFlags, key: FeatureFlagKey) {
  return flags[key];
}

export function updateFeatureFlag(
  flags: FeatureFlags,
  key: FeatureFlagKey,
  enabled: boolean,
): FeatureFlags {
  return { ...flags, [key]: enabled };
}
