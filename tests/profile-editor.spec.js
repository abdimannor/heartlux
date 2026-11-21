const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.locator('#home button[data-action="startDemo"]').click();
  await expect(page.locator('#matches.page.active')).toBeVisible();
});

/** A generated 1600x1000 PNG, made in the page so the test needs no fixture file. */
async function generatedPng(page) {
  const b64 = await page.evaluate(() => {
    const c = document.createElement('canvas');
    c.width = 1600; c.height = 1000;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#cc328c'; ctx.fillRect(0, 0, 1600, 1000);
    ctx.fillStyle = '#13c2c2'; ctx.fillRect(500, 200, 600, 600);
    return c.toDataURL('image/png').split(',')[1];
  });
  return { name: 'me.png', mimeType: 'image/png', buffer: Buffer.from(b64, 'base64') };
}

const storedPhoto = page => page.evaluate(() => new Promise(resolve => {
  const req = indexedDB.open('heartlux', 1);
  req.onupgradeneeded = () => req.result.createObjectStore('photos');
  req.onsuccess = () => {
    const get = req.result.transaction('photos').objectStore('photos').get('me');
    get.onsuccess = async () => {
      // Stored as a Blob, or as { type, bytes } where WebKit refuses Blobs.
      const v = get.result;
      const blob = v && !(v instanceof Blob) && v.bytes ? new Blob([v.bytes], { type: v.type }) : v;
      if (!blob) return resolve(null);
      const bmp = await createImageBitmap(blob);
      resolve({ type: blob.type, size: blob.size, width: bmp.width, height: bmp.height });
    };
  };
}));

test('an uploaded photo is cropped to the card, kept in IndexedDB and never sent anywhere', async ({ page }) => {
  const uploads = [];
  page.on('request', r => { if (r.method() !== 'GET') uploads.push(r.url()); });

  await page.locator('[data-page="profile"], [data-arg="profile"]').first().click();
  await expect(page.locator('#profile.page.active')).toBeVisible();
  await page.locator('#profilePhotoInput').setInputFiles(await generatedPng(page));

  await expect(page.locator('#profileDisplayAvatar img.own-photo')).toBeVisible();
  await expect(page.locator('#ownCardPhoto img')).toBeVisible();
  await expect(page.locator('#profilePhotoRemove')).toBeVisible();

  const photo = await storedPhoto(page);
  expect(photo.type).toBe('image/jpeg');
  expect(Math.max(photo.width, photo.height)).toBeLessThanOrEqual(800);
  expect(photo.width / photo.height).toBeCloseTo(3 / 4, 2);
  expect(uploads).toEqual([]);

  // It survives a reload and shows up in chats too.
  await page.reload();
  await page.locator('[data-page="profile"], [data-arg="profile"]').first().click();
  await expect(page.locator('#profileDisplayAvatar img.own-photo')).toBeVisible();
  await page.locator('[data-page="matches"]').first().click();
  await page.locator('#tabMyMatches').click();
  await page.locator('#matchesListGrid .match-list-card').first().click();
  await expect(page.locator('#chatSelfPhoto img')).toBeVisible();
  await page.locator('[data-action="closeChat"]').first().click();

  // Removing it clears the store.
  await page.locator('[data-page="profile"], [data-arg="profile"]').first().click();
  await page.locator('#profilePhotoRemove').click();
  await expect(page.locator('#profileDisplayAvatar img')).toHaveCount(0);
  expect(await storedPhoto(page)).toBeNull();
});

test('the prompt answer shows on the card preview and is saved', async ({ page }) => {
  await page.locator('[data-page="profile"], [data-arg="profile"]').first().click();
  await page.locator('#profilePromptSelect').selectOption('sunday');
  await page.locator('#profilePromptAnswer').fill('Långfrukost och en promenad vid vattnet');
  await expect(page.locator('#ownCardPromptQ')).toHaveText('Min perfekta söndag är...');
  await expect(page.locator('#ownCardPromptA')).toHaveText('Långfrukost och en promenad vid vattnet');
  await page.locator('[data-action="saveProfileBio"]').click();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('heartlux_user_prompt')));
  expect(saved).toEqual({ key: 'sunday', answer: 'Långfrukost och en promenad vid vattnet' });
});

test('the typing indicator belongs to the conversation it is for', async ({ page }) => {
  await page.locator('#tabMyMatches').click();
  const cards = page.locator('#matchesListGrid .match-list-card');
  await cards.nth(0).click();
  await page.locator('#chatInput').fill('Hej!');
  await page.locator('#chatInput').press('Enter');
  const typing = page.locator('#chatMessages .typing-indicator');
  await expect(typing).toBeVisible();

  // Another conversation never shows it.
  await page.locator('[data-action="closeChat"]').first().click();
  await cards.nth(1).click();
  await expect(typing).toHaveCount(0);
  await page.locator('[data-action="closeChat"]').first().click();

  // Back in the first chat the reply lands and the indicator is gone.
  await cards.nth(0).click();
  await expect(page.locator('#chatMessages .chat-bubble:not(.typing-indicator)')).toHaveCount(3, { timeout: 4000 });
  await expect(typing).toHaveCount(0);
});
