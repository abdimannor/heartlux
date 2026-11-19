const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  // The app builds random profiles and random match outcomes. Seed Math.random
  // so a run cannot fail just because no generated profile fits the filters.
  await page.addInitScript(() => {
    let seed = 20261119;
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
});

test('core onboarding, matching, language, dark mode, profile, and chat flow works', async ({ page }) => {
  test.setTimeout(20_000);

  await expect(page).toHaveTitle('Heartlux');
  await expect(page.locator('#home.page.active')).toBeVisible();
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', 'manifest.webmanifest');
  await expect.poll(async () => (await page.request.get('/manifest.webmanifest')).status()).toBe(200);
  await expect.poll(async () => (await page.request.get('/sw.js')).status()).toBe(200);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://abdimannor.github.io/heartlux/');
  await expect.poll(async () => (await page.request.get('/robots.txt')).status()).toBe(200);
  await expect.poll(async () => (await page.request.get('/sitemap.xml')).status()).toBe(200);

  await page.locator('[data-page="register"]').click();
  const registerForm = page.locator('#registerForm');
  await registerForm.locator('#username').fill('mahad');
  await registerForm.locator('#email').fill('mahad@example.com');
  await registerForm.locator('#password').fill('password123');
  await registerForm.locator('#confirmPassword').fill('password123');
  await registerForm.locator('#genderMale').check();
  await registerForm.locator('button[type="submit"]').click();

  await expect(page.locator('#discover.page.active')).toBeVisible({ timeout: 3000 });

  await page.locator('.option-card[data-value="female"]').click();
  await page.locator('#ageMin').evaluate(el => {
    el.value = '20';
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.locator('#ageMax').evaluate(el => {
    el.value = '40';
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.locator('#music').check();
  await page.locator('#travel').check();
  await page.locator('button[onclick="finishSetup()"]').click();

  await expect(page.locator('#matches.page.active')).toBeVisible({ timeout: 4000 });
  await expect(page.locator('#profileCard')).toBeVisible();

  await page.locator('#langToggle').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');

  await page.locator('#darkModeBtn').click();
  await expect(page.locator('body')).toHaveClass(/dark-mode/);

  await page.locator('[data-page="register"]').click();
  await expect(page.locator('#profile.page.active')).toBeVisible();
  await page.locator('#profileBioInput').fill('Building Heartlux with care.');
  await page.locator('button[onclick="saveProfileBio()"]').click();
  await expect(page.locator('#profileSaveMsg')).toContainText('Profile saved!');

  await page.locator('[data-page="matches"]').click();
  await page.evaluate(() => {
    const profile = {
      id: 9001,
      name: 'Sofia',
      age: 26,
      city: 'Stockholm',
      avatar: '👩',
      interests: ['music', 'travel'],
    };
    localStorage.setItem('heartlux_matches_list', JSON.stringify([profile]));
  });
  await page.locator('#tabMyMatches').click();
  await page.locator('#matchesListGrid .match-list-card').filter({ hasText: 'Sofia, 26' }).click();
  await page.locator('#chatInput').fill('Hello!');
  await page.locator('button[onclick="sendChatMessage()"]').click();
  await expect(page.locator('#chatMessages')).toContainText('Hello!');
});

test('demo button signs in a local demo account and opens discovery', async ({ page }) => {
  const demoButton = page.locator('#home button[onclick="startDemo()"]');
  await expect(demoButton).toHaveText('Testa demo');

  await demoButton.click();

  await expect(page.locator('#matches.page.active')).toBeVisible();
  await expect(page.locator('#profileCard')).toBeVisible();
  await expect(page.locator('#matchesBadge')).toHaveText('3');

  const stored = await page.evaluate(() => ({
    user: JSON.parse(localStorage.getItem('heartlux_user')),
    prefs: JSON.parse(localStorage.getItem('heartlux_preferences')),
    matches: JSON.parse(localStorage.getItem('heartlux_matches_list')),
  }));
  expect(stored.user.demo).toBe(true);
  expect(stored.user.password).toBeUndefined();
  expect(stored.prefs.interests.length).toBeGreaterThan(0);
  expect(stored.matches).toHaveLength(3);
  for (const match of stored.matches) {
    expect(String(match.id)).toMatch(/^demo-/);
    expect(match.age).toBeGreaterThanOrEqual(stored.prefs.minAge);
    expect(match.age).toBeLessThanOrEqual(stored.prefs.maxAge);
  }

  await page.locator('#tabMyMatches').click();
  await expect(page.locator('#matchesListGrid .match-list-card')).toHaveCount(3);
  await expect(page.locator('#matchesBadge')).toBeHidden();

  await page.locator('#langToggle').click();
  await page.locator('[data-page="home"]').first().click();
  await expect(demoButton).toHaveText('Try demo');
});

test('demo button asks before replacing an existing account', async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem('heartlux_user', JSON.stringify({ username: 'real', email: 'real@example.com', password: 'password123' }));
  });
  await page.reload();

  page.once('dialog', dialog => dialog.dismiss());
  await page.locator('#home button[onclick="startDemo()"]').click();

  const user = await page.evaluate(() => JSON.parse(localStorage.getItem('heartlux_user')));
  expect(user.username).toBe('real');
});
