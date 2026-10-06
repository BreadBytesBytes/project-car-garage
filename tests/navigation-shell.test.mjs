import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const tabs = ['index', 'work', 'events', 'parts', 'more'];

test('P0-07 exposes the five primary tabs and Quick Add', async () => {
  const [layout, rootLayout] = await Promise.all([
    readFile(new URL('apps/mobile/src/app/(tabs)/_layout.tsx', root), 'utf8'),
    readFile(new URL('apps/mobile/src/app/_layout.tsx', root), 'utf8'),
  ]);

  for (const tab of tabs) {
    assert.match(layout, new RegExp(`<Tabs\\.Screen name="${tab}"`));
    await access(new URL(`apps/mobile/src/app/(tabs)/${tab}.tsx`, root));
  }

  assert.match(layout, /<QuickAddButton/);
  assert.match(layout, /router\.push\('\/quick-add'\)/);
  assert.match(rootLayout, /anchor: '\(tabs\)'/);
  await access(new URL('apps/mobile/src/app/quick-add.tsx', root));
});

test('shared UI owns gluestack primitives, tokens, and instructive empty states', async () => {
  const [mobilePackage, uiPackage, uiSource] = await Promise.all([
    readFile(new URL('apps/mobile/package.json', root), 'utf8').then(
      JSON.parse,
    ),
    readFile(new URL('packages/ui/package.json', root), 'utf8').then(
      JSON.parse,
    ),
    readFile(new URL('packages/ui/src/index.tsx', root), 'utf8'),
  ]);

  assert.equal(mobilePackage.dependencies['@project-car-garage/ui'], '0.0.0');
  assert.equal(uiPackage.dependencies['@gluestack-ui/button'], '1.0.14');
  assert.match(uiSource, /createButton/);
  assert.match(uiSource, /export const tokens/);
  assert.match(uiSource, /export function EmptyState/);
  assert.match(uiSource, /export function QuickAddButton/);
});
