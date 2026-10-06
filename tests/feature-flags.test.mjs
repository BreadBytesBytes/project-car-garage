import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  defaultFeatureFlags,
  featureFlagKeys,
  isFeatureEnabled,
  updateFeatureFlag,
} from '../apps/mobile/src/features/featureFlags.ts';

test('experimental flags are typed, explicit, and disabled by default', () => {
  assert.deepEqual(featureFlagKeys, [
    'ai',
    'nativeShare',
    'knowledge',
    'debugScoring',
  ]);
  assert.deepEqual(defaultFeatureFlags, {
    ai: false,
    nativeShare: false,
    knowledge: false,
    debugScoring: false,
  });
});

test('a flag update changes visibility without mutating the defaults', () => {
  const enabled = updateFeatureFlag(defaultFeatureFlags, 'knowledge', true);

  assert.equal(isFeatureEnabled(enabled, 'knowledge'), true);
  assert.equal(isFeatureEnabled(defaultFeatureFlags, 'knowledge'), false);
});

test('developer controls are authenticated and drive a placeholder', async () => {
  const [developer, layout, more] = await Promise.all([
    readFile(
      new URL('../apps/mobile/src/app/developer.tsx', import.meta.url),
      'utf8',
    ),
    readFile(
      new URL('../apps/mobile/src/app/_layout.tsx', import.meta.url),
      'utf8',
    ),
    readFile(
      new URL('../apps/mobile/src/app/(tabs)/more.tsx', import.meta.url),
      'utf8',
    ),
  ]);

  const protectedStart = layout.indexOf(
    '<Stack.Protected guard={Boolean(session)}>',
  );
  const protectedEnd = layout.indexOf('</Stack.Protected>', protectedStart);
  const developerRoute = layout.indexOf('name="developer"');

  assert.ok(protectedStart >= 0);
  assert.ok(developerRoute > protectedStart && developerRoute < protectedEnd);
  assert.match(developer, /featureFlagKeys\.map/);
  assert.match(developer, /<Switch/);
  assert.match(more, /isFeatureEnabled\(flags, 'knowledge'\)/);
  assert.match(more, /Knowledge experiment enabled/);
});
