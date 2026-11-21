const { test, expect } = require('@playwright/test');

test.use({ contextOptions: { reducedMotion: 'reduce' } });

test('after the first load the app shell and demo work offline', async ({ page, context, browserName }) => {
  // Playwright's WebKit cannot reload an offline page through a service worker
  // ("WebKit encountered an internal error" on every run); this says nothing about
  // Safari itself, which this suite cannot drive. Chromium and Firefox cover it.
  test.skip(browserName === 'webkit', 'offline reload through a service worker is not supported by Playwright WebKit');
  await page.goto('/');
  await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    return reg.active.state;
  });
  // Reload once so the page is controlled by the active worker.
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);

  await context.setOffline(true);
  await page.reload();
  await expect(page).toHaveTitle('Heartlux');
  await expect(page.locator('#home.page.active')).toBeVisible();
  await expect(page.locator('nav')).toBeVisible();

  await page.locator('[data-action="startDemo"]').first().click();
  await expect(page.locator('#profileCard')).toBeVisible();
  await expect(page.locator('#cardName')).not.toHaveText('—');
  await page.locator('#openFilters').click();
  await expect(page.locator('#filterSheet')).toBeVisible();
  await page.keyboard.press('Escape');

  // A deep link that was never visited falls back to the cached shell.
  await page.goto('/?utm=offline#matches');
  await expect(page).toHaveTitle('Heartlux');
  await context.setOffline(false);
});
