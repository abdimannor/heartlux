const { test, expect } = require('@playwright/test');

// Timer lifecycle: delayed work must not land in the wrong place.
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('a delayed chat reply stays in the conversation it answers', async ({ page }) => {
  await page.locator('#home button[data-action="startDemo"]').click();
  await expect(page.locator('#matches.page.active')).toBeVisible();
  await page.locator('#tabMyMatches').click();
  const cards = page.locator('#matchesListGrid .match-list-card');
  await expect(cards).toHaveCount(3);

  await cards.nth(0).click();
  const firstId = await page.locator('#chatMessages').getAttribute('data-chat-id');
  await page.locator('#chatInput').fill('Only for the first chat');
  await page.locator('#chatInput').press('Enter');
  await page.locator('[data-action="closeChat"]').first().click();

  // Switch conversations before the reply timer (0.8 to 1.8 s) fires.
  await cards.nth(1).click();
  const secondId = await page.locator('#chatMessages').getAttribute('data-chat-id');
  expect(secondId).not.toBe(firstId);
  await page.waitForTimeout(2200);

  await expect(page.locator('#chatMessages .chat-bubble')).toHaveCount(1);
  await expect(page.locator('#chatMessages')).toHaveAttribute('data-chat-id', secondId);
  const chats = await page.evaluate(() => JSON.parse(localStorage.getItem('heartlux_chats')));
  expect(chats[firstId]).toHaveLength(3);
  expect(chats[firstId][2].from).toBe('match');
  expect(chats[secondId]).toHaveLength(1);
});

test('leaving Discover cancels the pending redirect to Matches', async ({ page }) => {
  await page.locator('[data-page="register"]').click();
  const form = page.locator('#registerForm');
  await form.locator('#username').fill('timer');
  await form.locator('#email').fill('timer@example.com');
  await form.locator('#password').fill('password123');
  await form.locator('#confirmPassword').fill('password123');
  await form.locator('#genderMale').check();
  await form.locator('button[type="submit"]').click();
  await expect(page.locator('#discover.page.active')).toBeVisible({ timeout: 3000 });

  await page.locator('.option-card[data-value="everyone"]').click();
  await page.locator('#music').check();
  await page.locator('button[data-action="finishSetup"]').click();
  await expect(page.locator('.setup-done')).toBeVisible();

  // Navigate away inside the 1.5 s window.
  await page.locator('[data-page="home"]').first().click();
  await expect(page.locator('#home.page.active')).toBeVisible();
  await page.waitForTimeout(2000);
  await expect(page.locator('#home.page.active')).toBeVisible();
  await expect(page.locator('#matches.page.active')).toHaveCount(0);
});
