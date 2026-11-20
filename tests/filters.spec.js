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

test('sample cards carry prompt answers under the bio', async ({ page }) => {
  await expect(page.locator('#cardName')).not.toHaveText('—');
  const seen = [];
  for (let i = 0; i < 6 && await page.locator('#profileCard').isVisible(); i++) {
    seen.push(await page.locator('#cardPrompt').isVisible());
    if (seen.at(-1)) {
      await expect(page.locator('#cardPromptQ')).not.toHaveText('');
      await expect(page.locator('#cardPromptA')).not.toHaveText('');
    }
    await page.locator('[data-action="passProfile"]').click();
    await page.waitForTimeout(600);
  }
  expect(seen).toContain(true);
});

test('filter sheet filters live, is remembered, and has a reset empty state', async ({ page }) => {
  await page.locator('#openFilters').click();
  const sheet = page.locator('#filterSheet');
  await expect(sheet).toBeVisible();

  await page.locator('#filterHasPrompt').check();
  await expect(page.locator('#filterCount')).toHaveText('1');
  await page.locator('[data-action="closeFilters"]').first().click();
  await expect(sheet).toBeHidden();

  for (let i = 0; i < 5 && await page.locator('#profileCard').isVisible(); i++) {
    await expect(page.locator('#cardPrompt')).toBeVisible();
    await page.locator('[data-action="passProfile"]').click();
  }

  // An impossible combination empties the deck and offers a reset.
  await page.locator('#openFilters').click();
  await page.locator('#filterMinAge').fill('79');
  await page.locator('#filterMaxAge').fill('80');
  await page.keyboard.press('Escape');
  await expect(page.locator('#noFilterMatch')).toBeVisible();
  await expect(page.locator('#profileCard')).toBeHidden();

  // Remembered after a reload.
  await page.reload();
  await page.locator('[data-page="matches"], [data-action="showPage"][data-arg="matches"]').first().click();
  await expect(page.locator('#noFilterMatch')).toBeVisible();
  await expect(page.locator('#filterCount')).toHaveText('2');

  await page.locator('#noFilterMatch [data-action="resetFilters"]').click();
  await expect(page.locator('#profileCard')).toBeVisible();
  await expect(page.locator('#noFilterMatch')).toBeHidden();
  await expect(page.locator('#filterCount')).toBeHidden();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('heartlux_filters')).minAge)).toBe(18);
});
