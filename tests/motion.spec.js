const { test, expect } = require('@playwright/test');

// Motion is on by default, even when the OS asks for reduced motion (the
// owner's Mac does). The navbar button turns it off; the choice survives a reload.
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

test('motion is on by default, even with reduced motion in the OS', async ({ page }) => {
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'on');
  const btn = page.locator('#motionBtn');
  await expect(btn).toHaveAttribute('aria-pressed', 'true');
  await expect(btn).toHaveAttribute('aria-label', 'Pausa rörelse');
  await expect(btn).toHaveText('');
  await expect(btn.locator('.i-pause')).toBeVisible();
  await expect(btn.locator('.i-play')).toBeHidden();
});

test('swipe spring and heart burst run by default', async ({ page }) => {
  await startDeck(page);
  expect(await dragCardAndRelease(page)).toContain('transform 0.5s');
  expect(await likeAndCheckBurst(page)).toBe(1);
});

test('the button turns motion off, and the choice survives reload', async ({ page }) => {
  await page.locator('#motionBtn').click();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'off');
  await expect(page.locator('#motionBtn')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#motionBtn')).toHaveAttribute('aria-label', 'Starta rörelse');
  await startDeck(page);
  expect(await dragCardAndRelease(page)).not.toContain('transform 0.5s');
  expect(await likeAndCheckBurst(page)).toBe(0);

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'off');
  await expect(page.locator('#motionBtn')).toHaveAttribute('aria-pressed', 'false');
});

test('the motion off choice is applied before first paint', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('heartlux_motion', 'off'));
  const seen = [];
  page.on('console', m => seen.push(m.text()));
  await page.addInitScript(() => {
    document.addEventListener('readystatechange', () => {
      if (document.readyState === 'interactive') console.log('motion:' + document.documentElement.dataset.motion);
    }, { once: true });
  });
  await page.reload();
  await expect.poll(() => seen.join()).toContain('motion:off');
});

test('the controls are quiet icons with names in the page language', async ({ page }) => {
  for (const id of ['#langToggle', '#motionBtn', '#darkModeBtn']) {
    const box = await page.locator(id).boundingBox();
    expect(Math.round(box.height)).toBe(34);
  }
  await expect(page.locator('#langToggle')).toHaveAttribute('aria-label', 'Byt till engelska, EN');
  await expect(page.locator('#langToggle .ctl-code')).toHaveAttribute('lang', 'en');
  await expect(page.locator('#darkModeBtn')).toHaveAttribute('aria-label', 'Byt till mörkt läge');
  await page.locator('#langToggle').click();
  await expect(page.locator('#langToggle')).toHaveAttribute('aria-label', 'Switch to Swedish, SV');
  await expect(page.locator('#langToggle .ctl-code')).toHaveText('SV');
  await expect(page.locator('#langToggle .ctl-code')).toHaveAttribute('lang', 'sv');
  await expect(page.locator('#motionBtn')).toHaveAttribute('aria-label', 'Pause motion');
  await expect(page.locator('#darkModeBtn')).toHaveAttribute('aria-label', 'Switch to dark mode');
  await page.locator('#darkModeBtn').click();
  await expect(page.locator('#darkModeBtn')).toHaveAttribute('aria-label', 'Switch to light mode');
});
