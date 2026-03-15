const { test, expect } = require('@playwright/test');

const BASE_URL = 'file:///C:/Users/User/Claude/MathQuiz/index.html';

/**
 * Helper: enter PIN code 2609 by typing digits one by one.
 * The app auto-focuses the next digit on input and auto-submits when 4 digits are entered.
 */
async function enterPIN(page, code = '2609') {
  const digits = page.locator('.pin-digit');
  for (let i = 0; i < 4; i++) {
    await digits.nth(i).fill(code[i]);
  }
}

/**
 * Helper: enter PIN + create a profile + land on home screen.
 */
async function setupProfile(page, name = 'TestPlayer') {
  await enterPIN(page);
  await page.waitForSelector('#screen-profiles', { state: 'visible', timeout: 3000 });
  await page.click('#btn-new-profile');
  await page.fill('#profile-name-input', name);
  await page.click('#btn-create-profile');
  await page.waitForSelector('#screen-home', { state: 'visible', timeout: 3000 });
}

/**
 * Helper: click Play then skip contract screen.
 */
async function startGameNoContract(page) {
  await page.click('#btn-play');
  await page.waitForSelector('#screen-contract', { state: 'visible', timeout: 3000 });
  await page.click('#btn-no-contract');
}

test.describe('MathQuiz E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    // Clear all storage for clean state
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    await page.reload();
    await page.waitForSelector('#screen-pin', { state: 'visible', timeout: 3000 });
  });

  test('PIN screen shows on first load', async ({ page }) => {
    await expect(page.locator('#screen-pin')).toBeVisible();
    await expect(page.locator('.pin-digit').first()).toBeVisible();
  });

  test('Wrong PIN shows error', async ({ page }) => {
    await enterPIN(page, '1234');
    await expect(page.locator('#pin-error')).toContainText('incorrect', { ignoreCase: true });
  });

  test('Correct PIN unlocks app', async ({ page }) => {
    await enterPIN(page);
    // PIN screen should be hidden (uses style.display = none)
    await expect(page.locator('#screen-profiles')).toBeVisible({ timeout: 3000 });
  });

  test('Create profile and reach home screen', async ({ page }) => {
    await enterPIN(page);
    await page.waitForSelector('#screen-profiles', { state: 'visible', timeout: 3000 });

    // Create new profile
    await page.click('#btn-new-profile');
    await expect(page.locator('#screen-create-profile')).toBeVisible();

    await page.fill('#profile-name-input', 'TestPlayer');
    await page.click('#btn-create-profile');

    // Should be on home screen
    await expect(page.locator('#screen-home')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('#profile-name-display')).toContainText('TestPlayer');
  });

  test('Play a full game of 5 questions', async ({ page }) => {
    await setupProfile(page, 'Gamer');

    // Start game (skip contract)
    await startGameNoContract(page);
    await expect(page.locator('#screen-game')).toBeVisible();

    // Answer 5 questions
    for (let i = 0; i < 5; i++) {
      await expect(page.locator('#question-text')).not.toBeEmpty();
      await page.fill('#answer-input', '42');
      await page.click('#btn-validate');

      // Wait for feedback (display changes from none to visible)
      await expect(page.locator('#feedback-section')).toBeVisible({ timeout: 3000 });

      // Click next (or "Voir les résultats" on last question)
      await page.click('#btn-next');
    }

    // Should show end screen
    await expect(page.locator('#screen-end')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#final-score')).not.toBeEmpty();
    // XP and coins should be displayed
    await expect(page.locator('#xp-earned')).toBeVisible();
    await expect(page.locator('#coins-earned')).toBeVisible();
  });

  test('Shop is accessible and shows items', async ({ page }) => {
    await setupProfile(page, 'Shopper');

    // Open shop
    await page.click('#btn-shop');
    await expect(page.locator('#screen-shop')).toBeVisible();

    // Should have shop items
    const shopItems = page.locator('.shop-item');
    await expect(shopItems.first()).toBeVisible({ timeout: 3000 });

    // Should show locked boosts message
    await expect(page.locator('.shop-locked-msg')).toBeVisible();

    // Go back
    await page.click('#btn-shop-back');
    await expect(page.locator('#screen-home')).toBeVisible();
  });

  test('Profile detail shows badges', async ({ page }) => {
    await setupProfile(page, 'BadgeHunter');

    // Open profile detail
    await page.click('#btn-profile-detail');
    await expect(page.locator('#screen-profile-detail')).toBeVisible();

    // Should show badge sections (ID not class)
    await expect(page.locator('#profile-badges-list')).toBeVisible();
    await expect(page.locator('.badge-item').first()).toBeVisible();

    // Go back
    await page.click('#btn-profile-back');
    await expect(page.locator('#screen-home')).toBeVisible();
  });

  test('Enter key works for answer validation and next question', async ({ page }) => {
    await setupProfile(page, 'EnterTest');

    // Start game (skip contract)
    await startGameNoContract(page);
    await expect(page.locator('#screen-game')).toBeVisible();

    // Type answer and press Enter to validate
    await page.fill('#answer-input', '42');
    await page.keyboard.press('Enter');

    // Should show feedback
    await expect(page.locator('#feedback-section')).toBeVisible({ timeout: 3000 });

    // Press Enter again to go to next question
    await page.keyboard.press('Enter');

    // Should be on question 2 (format: "2 / 5")
    await expect(page.locator('#question-counter')).toContainText('2 /');
  });

  test('Hint system works', async ({ page }) => {
    await setupProfile(page, 'HintTest');
    await startGameNoContract(page);
    await expect(page.locator('#screen-game')).toBeVisible();

    // Click hint button
    await page.click('#btn-hint');

    // Hint text should be visible
    await expect(page.locator('#hint-text')).toBeVisible();
    // Hint text should have content
    await expect(page.locator('#hint-text')).not.toBeEmpty();
  });

  test('Game state persists on refresh', async ({ page }) => {
    await setupProfile(page, 'PersistTest');

    // Start game and answer first question
    await startGameNoContract(page);
    await expect(page.locator('#screen-game')).toBeVisible();
    await page.fill('#answer-input', '42');
    await page.click('#btn-validate');
    await expect(page.locator('#feedback-section')).toBeVisible({ timeout: 3000 });
    await page.click('#btn-next');

    // Should now be on question 2
    await expect(page.locator('#question-counter')).toContainText('2 /');

    // Refresh — sessionStorage persists within same tab
    await page.reload();

    // Session storage should keep unlock state, game should resume
    await page.waitForSelector('#screen-game', { state: 'visible', timeout: 5000 });

    // Should still be on question 2 (restored state)
    await expect(page.locator('#question-counter')).toContainText('2 /');
  });

});
