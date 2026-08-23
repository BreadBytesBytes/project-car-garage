import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('foundation workspace is complete', async () => {
  const packageJson = JSON.parse(await readFile(new URL('package.json', root)));
  const mobilePackage = JSON.parse(
    await readFile(new URL('apps/mobile/package.json', root)),
  );

  assert.deepEqual(packageJson.workspaces, ['apps/*', 'packages/*']);
  assert.equal(mobilePackage.main, 'expo-router/entry');

  await Promise.all(
    [
      'packages/ai',
      'packages/database',
      'packages/domain',
      'packages/knowledge',
      'packages/recommendation-engine',
      'packages/shared',
      'packages/ui',
      'supabase/functions',
      'supabase/migrations',
    ].map((path) => access(new URL(path, root))),
  );
});
