import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('Supabase is configured as a project-scoped dependency', async () => {
  const packageJson = JSON.parse(await readFile(new URL('package.json', root)));
  const config = await readFile(new URL('supabase/config.toml', root), 'utf8');
  const envExample = await readFile(new URL('.env.example', root), 'utf8');

  assert.match(packageJson.devDependencies.supabase, /^\^2\./);
  assert.equal(packageJson.scripts['db:reset'], 'supabase db reset');
  assert.match(config, /project_id = "project-car-garage"/);
  assert.match(config, /\[db\.migrations\][\s\S]*?enabled = true/);
  assert.match(envExample, /^EXPO_PUBLIC_SUPABASE_URL=$/m);
  assert.match(envExample, /^EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$/m);
  assert.doesNotMatch(envExample, /SERVICE_ROLE\s*=/i);
});
