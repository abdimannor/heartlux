const { test, expect } = require('@playwright/test');

// The owner's Mac has Reduce motion on. The OS setting is the default, and the
// navbar switch overrides it; the choice survives a reload.
test.use({ contextOptions: { reducedMotion: 'reduce' } });

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

async function startDeck(page) {
  await page.locator('#home button[data-action="startDemo"]').click();
  await expect(page.locator('#profileCard')).toBeVisible();
  // Let the page view transition finish: it overlays the page and takes the pointer.
  await page.waitForTimeout(800);
  // Every like becomes a match from here on, so the heart burst is predictable.
  await page.evaluate(() => { Math.random = () => 0.1; });
}

async function dragCardAndRelease(page) {
  // Record every transition the card is given, so the check does not race the
  // timers that tidy the inline style afterwards.
  await page.locator('#profileCard').evaluate(el => {
    window.__transitions = [];
    window.__obs?.disconnect();
    window.__obs = new MutationObserver(() => window.__transitions.push(el.style.transition));
    window.__obs.observe(el, { attributes: true, attributeFilter: ['style'] });
  });
  const box = await page.locator('#profileCard').boundingBox();
  const x = box.x + box.width / 2, y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  for (const dx of [10, 20, 30, 40]) {
    await page.mouse.move(x + dx, y);
    await page.waitForTimeout(40);
  }
  // Hold still so the release is a slow drop (spring back), not a fling.
  await page.waitForTimeout(150);
  await page.mouse.move(x + 40, y);
  await page.mouse.up();
  await page.waitForTimeout(100);
  return page.evaluate(() => window.__transitions.join(' | '));
}

async function likeAndCheckBurst(page) {
  await page.locator('[data-action="likeProfile"]').first().click();
  await expect(page.locator('#matchPopup')).toBeVisible();
  const burst = await page.locator('#matchPopup canvas.match-burst').count();
  await page.locator('[data-action="closeMatchPopup"]').first().click();
  return burst;
}

test('reduced motion is the default and the switch shows it', async ({ page }) => {
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduce');
  const btn = page.locator('#motionBtn');
  await expect(btn).toHaveAttribute('aria-pressed', 'false');
  await expect(btn).toHaveText(/Rörelse av/);
  await expect(btn).toHaveAttribute('aria-label', /systemets inställning/);
});

test('no heart burst or swipe spring by default', async ({ page }) => {
  await startDeck(page);
  expect(await dragCardAndRelease(page)).not.toContain('transform 0.5s');
  expect(await likeAndCheckBurst(page)).toBe(0);
});

test('the switch turns on the swipe spring and heart burst, and the choice survives reload', async ({ page }) => {
  await page.locator('#motionBtn').click();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'full');
  await expect(page.locator('#motionBtn')).toHaveAttribute('aria-pressed', 'true');
  await startDeck(page);
  expect(await dragCardAndRelease(page)).toContain('transform 0.5s');
  expect(await likeAndCheckBurst(page)).toBe(1);

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'full');
  await expect(page.locator('#motionBtn')).toHaveText(/Rörelse på/);
  await expect(page.locator('#motionBtn')).not.toHaveAttribute('aria-label', /systemets/);
});

test('the switch label follows the language', async ({ page }) => {
  await page.locator('#langToggle').click();
  await expect(page.locator('#motionBtn')).toHaveText(/Motion off/);
});
