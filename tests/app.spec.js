const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
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
