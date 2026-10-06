import {
  createContext,
  type PropsWithChildren,
  useContext,
  useState,
} from 'react';

import {
  defaultFeatureFlags,
  type FeatureFlagKey,
  type FeatureFlags,
  updateFeatureFlag,
} from './featureFlags';

type FeatureFlagState = {
  flags: FeatureFlags;
  setFlag: (key: FeatureFlagKey, enabled: boolean) => void;
};

const FeatureFlagContext = createContext<FeatureFlagState | null>(null);

export function FeatureFlagProvider({ children }: PropsWithChildren) {
  const [flags, setFlags] = useState(defaultFeatureFlags);

  function setFlag(key: FeatureFlagKey, enabled: boolean) {
    setFlags((current) => updateFeatureFlag(current, key, enabled));
  }

  return (
    <FeatureFlagContext.Provider value={{ flags, setFlag }}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureFlags() {
  const value = useContext(FeatureFlagContext);
  if (!value) {
    throw new Error('useFeatureFlags must be used within FeatureFlagProvider');
  }
  return value;
}
