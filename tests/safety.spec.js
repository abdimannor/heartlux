const { test, expect } = require('@playwright/test');

test.use({ contextOptions: { reducedMotion: 'reduce' } });

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

const matches = page => page.evaluate(() => JSON.parse(localStorage.getItem('heartlux_matches_list') || '[]'));

async function getMatches(page, n = 1) {
  for (let i = 0; i < 40 && (await matches(page)).length < n; i++) {
    const popup = page.locator('[data-action="closeMatchPopup"]').first();
    if (await popup.isVisible()) await popup.click();
    await page.locator('[data-action="likeProfile"]').click();
    await page.waitForTimeout(450);
  }
  const popup = page.locator('[data-action="closeMatchPopup"]').first();
  if (await popup.isVisible()) await popup.click();
  await page.locator('#tabMyMatches').click();
  await expect(page.locator('.match-list-card').nth(n - 1)).toBeVisible();
}

test('unmatch from the chat asks first, then removes the match and conversation', async ({ page }) => {
  await getMatches(page, 1);
  const [first] = await matches(page);
  await page.locator('.match-list-card .btn-primary').first().click();
  await expect(page.locator('#chatModal')).toBeVisible();
  await page.locator('#chatSafety summary').click();
  await page.locator('#chatSafety .safety-item--unmatch').click();
  const dialog = page.locator('#confirmDialog');
  await expect(dialog).toBeVisible();
  await expect(page.locator('#confirmTitle')).toContainText(first.name);
  // Cancel keeps everything and returns focus to the menu button.
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(page.locator('#chatSafety summary')).toBeFocused();
  expect((await matches(page)).map(m => m.id)).toContain(first.id);

  await page.locator('#chatSafety summary').click();
  await page.locator('#chatSafety .safety-item--unmatch').click();
  await page.locator('#confirmOk').click();
  await expect(page.locator('#chatModal')).toBeHidden();
  await expect.poll(async () => (await matches(page)).map(m => m.id)).not.toContain(first.id);
  const chats = await page.evaluate(() => JSON.parse(localStorage.getItem('heartlux_chats') || '{}'));
  expect(chats[String(first.id)]).toBeUndefined();
  await expect(page.locator('#safetyStatus')).toContainText(first.name);
});

test('block hides the profile from Discover for good and unblock brings it back', async ({ page }) => {
  await getMatches(page, 1);
  const [first] = await matches(page);
  const card = page.locator('.match-list-card').first();
  await card.locator('summary').click();
  await card.locator('.safety-item--block').click();
  await expect(page.locator('#confirmDialog')).toBeVisible();
  await page.locator('#confirmOk').click();
  await expect.poll(async () => (await matches(page)).map(m => m.id)).not.toContain(first.id);
  const blocked = await page.evaluate(() => JSON.parse(localStorage.getItem('heartlux_blocked')));
  expect(blocked.map(b => b.id)).toEqual([first.id]);

  // After a reload and a fresh deck (likes cleared), the blocked profile never shows.
  await page.evaluate(() => { localStorage.removeItem('heartlux_likes'); localStorage.removeItem('heartlux_passes'); });
  await page.reload();
  await page.locator('[data-action="showPage"][data-arg="matches"]').first().click();
  const ids = await page.evaluate(() => import('./js/state.js').then(m => m.session.match.profiles.map(p => p.id)));
  expect(ids.length).toBeGreaterThan(0);
  expect(ids).not.toContain(first.id);

  // Blocked list in the profile with Unblock.
  await page.locator('#profileNavLink').click();
  const row = page.locator('#blockedList li');
  await expect(row).toHaveCount(1);
  await expect(row).toContainText(first.name);
  await expect(page.locator('#blockedEmpty')).toBeHidden();
  await row.getByRole('button').click();
  await expect(row).toHaveCount(0);
  await expect(page.locator('#blockedEmpty')).toBeVisible();
  await expect(page.locator('#blockedHeading')).toBeFocused();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('heartlux_blocked')))).toEqual([]);
});

test('report needs a reason, is stored locally, says so, and can also block', async ({ page }) => {
  await getMatches(page, 1);
  const [first] = await matches(page);
  const card = page.locator('.match-list-card').first();
  await card.locator('summary').click();
  await card.locator('.safety-item--report').click();
  const dialog = page.locator('#reportDialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('.safety-note')).toContainText(/webbläsare|browser/);
  // Submitting without a reason is blocked by the required radio group.
  await dialog.locator('button[value="send"]').click();
  await expect(dialog).toBeVisible();
  await dialog.locator('input[value="fake"]').check();
  await dialog.locator('textarea').fill('Bad vibes');
  await dialog.locator('input[name="alsoBlock"]').check();
  await dialog.locator('button[value="send"]').click();
  await expect(dialog).toBeHidden();
  await expect(page.locator('#safetyStatus')).toContainText(/Rapporten|report/);
  const reports = await page.evaluate(() => JSON.parse(localStorage.getItem('heartlux_reports')));
  expect(reports).toHaveLength(1);
  expect(reports[0]).toMatchObject({ id: first.id, reason: 'fake', details: 'Bad vibes' });
  await expect.poll(async () => (await matches(page)).map(m => m.id)).not.toContain(first.id);
  await expect(page.locator('#safetyStatus')).toContainText(first.name);
});

test('before-you-meet tips open from the chat and close back to the menu', async ({ page }) => {
  await getMatches(page, 1);
  await page.locator('.match-list-card').first().click();
  await page.locator('#chatSafety summary').click();
  await page.locator('#chatSafety .safety-item--tips').click();
  const tips = page.locator('#tipsDialog');
  await expect(tips).toBeVisible();
  await expect(tips.locator('li')).toHaveCount(6);
  await expect(tips.locator('a[href="https://polisen.se/"]')).toBeVisible();
  await tips.getByRole('button').click();
  await expect(tips).toBeHidden();
  await expect(page.locator('#chatSafety summary')).toBeFocused();
});

test('keyboard swiping: arrows pass and like, Up opens details, results are announced', async ({ page }) => {
  await expect(page.locator('#swipeKeyHint kbd')).toHaveCount(3);
  const name = async () => (await page.locator('#cardName').textContent()).split(',')[0];
  const first = await name();
  await page.locator('#profileCard').focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#deckStatus')).toContainText(first);
  await expect(page.locator('#deckStatus')).toContainText(/passade|passed/);
  const second = await name();
  expect(second).not.toBe(first);

  await page.keyboard.press('ArrowUp');
  const details = page.locator('#detailsDialog');
  await expect(details).toBeVisible();
  await expect(page.locator('#detailsName')).toContainText(second);
  // Arrows do nothing while the dialog is open.
  await page.keyboard.press('ArrowRight');
  expect(await name()).toBe(second);
  await page.keyboard.press('Escape');
  await expect(details).toBeHidden();
  await expect(page.locator('#profileCard')).toBeFocused();

  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#deckStatus')).toContainText(second);
  await expect(page.locator('#deckStatus')).toContainText(/gillade|match/);
});
