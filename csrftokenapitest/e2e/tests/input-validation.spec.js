const { test, expect } = require('@playwright/test');

test.describe('Input validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
  });

  test('name field enforces max 50 characters', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.waitForSelector('#name');

    const longName = 'a'.repeat(60);
    await page.fill('#name', longName);
    const value = await page.inputValue('#name');
    expect(value.length).toBeLessThanOrEqual(50);
  });

  test('birthdate field validates YYYY-MM-DD format', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.waitForSelector('#birthdate');

    // Enter invalid date
    await page.fill('#birthdate', '01-01-1990');
    await page.press('#birthdate', 'Tab');
    // Trigger validation by clicking submit
    await page.click('#submit-btn');

    // Expect an error element to be visible
    const visible = await page.isVisible('#birthdate-error');
    expect(visible).toBeTruthy();
    const text = await page.textContent('#birthdate-error');
    expect(text).toContain('YYYY-MM-DD');
  });
});
