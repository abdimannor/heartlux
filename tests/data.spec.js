const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const os = require('os');

test.use({ contextOptions: { reducedMotion: 'reduce' } });

/** A small PNG drawn in the page, so the test needs no fixture file. */
async function generatedPng(page) {
  const b64 = await page.evaluate(() => {
    const c = document.createElement('canvas');
    c.width = 300; c.height = 400;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#cc328c'; ctx.fillRect(0, 0, 300, 400);
    return c.toDataURL('image/png').split(',')[1];
  });
  return { name: 'me.png', mimeType: 'image/png', buffer: Buffer.from(b64, 'base64') };
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    let seed = 20261121;
    Math.random = () => {
      seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  });
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.locator('[data-action="startDemo"]').first().click();
  await expect(page.locator('#profileCard')).toBeVisible();
});

const read = (page, key, fb) => page.evaluate(([k, f]) => JSON.parse(localStorage.getItem(k) || f), [key, fb]);

/** Like until one match, send a chat message, add a photo. */
async function buildState(page) {
  for (let i = 0; i < 40 && (await read(page, 'heartlux_matches_list', '[]')).length < 1; i++) {
    const popup = page.locator('[data-action="closeMatchPopup"]').first();
    if (await popup.isVisible()) await popup.click();
    await page.locator('[data-action="likeProfile"]').click();
    await page.waitForTimeout(450);
  }
  const popup = page.locator('[data-action="closeMatchPopup"]').first();
  if (await popup.isVisible()) await popup.click();
  await page.locator('#tabMyMatches').click();
  await page.locator('.match-list-card .btn-primary').first().click();
  await page.locator('#chatInput').fill('Hej från testet');
  await page.locator('#chatInput').press('Enter');
  await page.locator('[data-action="closeChat"]').first().click();
  await page.evaluate(() => import('./js/ui/navigation.js').then(m => m.showPage('profile')));
  await page.locator('#profilePhotoInput').setInputFiles(await generatedPng(page));
  await expect(page.locator('#profilePhotoRemove')).toBeVisible();
}

async function openData(page) {
  await page.evaluate(() => import('./js/ui/navigation.js').then(m => m.showPage('profile')));
  await page.locator('[data-action="showPage"][data-arg="data"]').click();
  await expect(page.locator('#data')).toHaveClass(/active/);
  await expect(page.locator('#dataInventory .data-row').first()).toBeVisible();
}

const rowCount = (page, id) => page.locator(`.data-row[data-category="${id}"] .data-row-count`).innerText();

test('the inventory counts what is really stored', async ({ page }) => {
  await buildState(page);
  await openData(page);
  const likes = await read(page, 'heartlux_likes', '[]');
  const passes = await read(page, 'heartlux_passes', '[]');
  const matches = await read(page, 'heartlux_matches_list', '[]');
  const chats = await read(page, 'heartlux_chats', '{}');
  const messages = Object.values(chats).reduce((n, l) => n + l.length, 0);
  expect(messages).toBeGreaterThan(0);
  expect(await rowCount(page, 'profile')).toContain('1');
  expect(await rowCount(page, 'likes')).toContain(String(likes.length + passes.length));
  expect(await rowCount(page, 'matches')).toContain(String(matches.length));
  expect(await rowCount(page, 'chats')).toContain(String(messages));
  expect(await rowCount(page, 'photo')).toContain('1');
  await expect(page.locator('#dataTotal')).toContainText('kB');
});

test('export, delete everything, import restores profile, matches, chats and photo', async ({ page }) => {
  await buildState(page);
  const before = await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).map(k => [k, localStorage.getItem(k)])));
  await openData(page);
  const download = page.waitForEvent('download');
  await page.locator('[data-action="exportData"]').click();
  const file = path.join(os.tmpdir(), `heartlux-export-${Date.now()}.json`);
  await (await download).saveAs(file);
  const exported = JSON.parse(fs.readFileSync(file, 'utf8'));
  expect(exported.app).toBe('heartlux');
  expect(exported.schema).toBe(1);
  expect(exported.photo).toMatch(/^data:image\/jpeg;base64,/);

  await page.locator('#dataWipeButton').click();
  await expect(page.locator('#wipeDialog')).toBeVisible();
  await Promise.all([page.waitForEvent('load'), page.locator('#wipeOk').click()]);
  await expect(page.locator('#home')).toHaveClass(/active/);
  expect(await page.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('heartlux_')).length)).toBe(0);

  // Import on the "other device": the start screen of a fresh browser.
  await page.evaluate(() => import('./js/ui/navigation.js').then(m => { document.querySelectorAll('.page').forEach(p => p.classList.remove('active')); document.getElementById('data').classList.add('active'); return import('./js/ui/data.js').then(d => d.renderDataPage()); }));
  await page.locator('#dataImportInput').setInputFiles(file);
  await expect(page.locator('#importDialog')).toBeVisible();
  await expect(page.locator('#importSummary')).toContainText(`${JSON.parse(exported.storage.heartlux_matches_list).length} matchningar`);
  await expect(page.locator('#importSummary')).toContainText('ett foto');
  await Promise.all([page.waitForEvent('load'), page.locator('#importOk').click()]);
  await expect(page.locator('#data')).toHaveClass(/active/);
  await expect(page.locator('#dataStatus')).not.toBeEmpty();

  const after = await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).map(k => [k, localStorage.getItem(k)])));
  for (const key of ['heartlux_user', 'heartlux_matches_list', 'heartlux_chats', 'heartlux_likes']) {
    expect(after[key]).toBe(before[key]);
  }
  expect(await rowCount(page, 'photo')).toContain('1');
  await page.evaluate(() => import('./js/ui/navigation.js').then(m => m.showPage('profile')));
  await expect(page.locator('#profileDisplayAvatar img.own-photo')).toBeVisible();
  fs.unlinkSync(file);
});

test('an invalid file is rejected with a clear message and nothing changes', async ({ page }) => {
  await openData(page);
  const before = await page.evaluate(() => localStorage.getItem('heartlux_user'));
  await page.locator('#dataImportInput').setInputFiles({ name: 'x.json', mimeType: 'application/json', buffer: Buffer.from('{"app":"other","schema":1}') });
  await expect(page.locator('#dataStatus')).toHaveClass(/data-status--error/);
  await expect(page.locator('#dataStatus')).toContainText(/Heartlux/);
  await expect(page.locator('#importDialog')).toBeHidden();
  await page.locator('#dataImportInput').setInputFiles({ name: 'x.json', mimeType: 'application/json', buffer: Buffer.from('not json') });
  await expect(page.locator('#dataStatus')).toContainText(/JSON/);
  await page.locator('#dataImportInput').setInputFiles({ name: 'x.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ app: 'heartlux', schema: 99, storage: {} })) });
  await expect(page.locator('#dataStatus')).toContainText(/version/);
  expect(await page.evaluate(() => localStorage.getItem('heartlux_user'))).toBe(before);
});

test('delete everything leaves localStorage, IndexedDB and caches empty', async ({ page }) => {
  await buildState(page);
  await openData(page);
  await page.locator('#dataWipeButton').click();
  // Cancel first: nothing is removed.
  await page.keyboard.press('Escape');
  await expect(page.locator('#wipeDialog')).toBeHidden();
  expect(await page.evaluate(() => localStorage.getItem('heartlux_user'))).not.toBeNull();
  await page.locator('#dataWipeButton').click();
  await Promise.all([page.waitForEvent('load'), page.locator('#wipeOk').click()]);
  await expect(page.locator('#home')).toHaveClass(/active/);
  const left = await page.evaluate(async () => ({
    keys: Object.keys(localStorage).filter(k => k.startsWith('heartlux_')),
    dbs: (await indexedDB.databases()).map(d => d.name),
    caches: (await caches.keys()).filter(k => k.startsWith('heartlux-')),
  }));
  expect(left.keys).toEqual([]);
  expect(left.dbs).not.toContain('heartlux');
  // The service worker may re-cache the start page on reload; the old caches must be gone.
  expect(left.caches.filter(k => k !== 'heartlux-v17')).toEqual([]);
});
