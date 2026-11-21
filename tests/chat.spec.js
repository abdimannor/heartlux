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

/** Like cards until there are at least n matches, then open the matches tab. */
async function getMatches(page, n = 2) {
  for (let i = 0; i < 40; i++) {
    const count = await page.evaluate(() => JSON.parse(localStorage.getItem('heartlux_matches_list') || '[]').length);
    if (count >= n) break;
    const popup = page.locator('[data-action="closeMatchPopup"]').first();
    if (await popup.isVisible()) await popup.click();
    if (!(await page.locator('#profileCard').isVisible())) break;
    await page.locator('[data-action="likeProfile"]').click();
    await page.waitForTimeout(450);
  }
  const popup = page.locator('[data-action="closeMatchPopup"]').first();
  if (await popup.isVisible()) await popup.click();
  await page.locator('#tabMyMatches').click();
  await expect(page.locator('.match-list-card').nth(n - 1)).toBeVisible();
}

test('chat suggests three openers that insert into the field, then hides them', async ({ page }) => {
  await getMatches(page, 1);
  await page.locator('.match-list-card').first().click();
  const chips = page.locator('#chatStarters .chat-starter');
  await expect(chips).toHaveCount(3);
  const first = await chips.first().textContent();
  await chips.first().click();
  await expect(page.locator('#chatInput')).toHaveValue(first);
  await expect(page.locator('#chatInput')).toBeFocused();
  await page.locator('#chatInput').press('Enter');
  await expect(page.locator('#chatMessages')).toContainText(first);
  await expect(page.locator('#chatStarters')).toBeHidden();
});

test('starters use the match prompt answer and shared interests', async ({ page }) => {
  const ideas = await page.evaluate(async () => {
    const { buildStarters } = await import('./js/ui/chat-starters.js');
    const profile = { name: 'Emma', city: 'Örebro', interests: ['music', 'books', 'art'],
      prompt: { key: 'dinner', answer: 'Tacos, alltid på fredagar' } };
    return { sv: buildStarters('sv', profile, ['books', 'music']), en: buildStarters('en', { ...profile, prompt: null }, []) };
  });
  expect(ideas.sv).toHaveLength(3);
  expect(ideas.sv[0]).toContain('Tacos, alltid på fredagar');
  expect(ideas.sv[1]).toContain('musik');
  expect(ideas.sv[2]).toMatch(/musik eller böcker/);
  expect(ideas.en).toHaveLength(2);
  expect(ideas.en[0]).toContain('Örebro');
});

test('chats survive reload, search filters by name and text, unread dot marks new replies', async ({ page }) => {
  await getMatches(page, 2);
  const cards = page.locator('.match-list-card');
  const secondName = (await cards.nth(1).locator('strong').textContent()).split(',')[0].trim();

  await cards.first().click();
  await page.locator('#chatInput').fill('Pannkakor med lingon');
  await page.locator('#chatInput').press('Enter');
  await page.locator('[data-action="closeChat"]').click();
  // The reply lands while the chat is closed, so the conversation gets an unread dot.
  await expect(cards.first().locator('.unread-dot')).toBeVisible({ timeout: 5000 });
  await expect(cards.nth(1).locator('.unread-dot')).toHaveCount(0);

  await page.reload();
  await page.locator('[data-action="showPage"][data-arg="matches"]').first().click();
  await page.locator('#tabMyMatches').click();
  await expect(cards.first().locator('.unread-dot')).toBeVisible();

  await page.locator('#matchSearch').fill('lingon');
  await expect(cards).toHaveCount(1);
  await cards.first().click();
  await expect(page.locator('#chatMessages')).toContainText('Pannkakor med lingon');
  await page.locator('[data-action="closeChat"]').click();
  await expect(cards.first().locator('.unread-dot')).toHaveCount(0);

  await page.locator('#matchSearch').fill(secondName.toLowerCase());
  await expect(cards.first()).toContainText(secondName);
  await page.locator('#matchSearch').fill('zzzz');
  await expect(page.locator('.match-search-empty')).toContainText('zzzz');
});
