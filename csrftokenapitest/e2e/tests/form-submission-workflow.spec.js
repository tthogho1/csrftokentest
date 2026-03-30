const { test, expect } = require('@playwright/test');

test.describe('Form submission workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
  });

  test('submitting the input form sends POST /api/submit with X-CSRF-TOKEN', async ({ page }) => {
    await page.fill('#name', 'Test User');
    await page.fill('#birthdate', '1990-01-01');

    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/submit')),
      page.click('#submit-btn'),
    ]);

    expect(response.url()).toContain('/api/submit');
    expect(response.request().method()).toBe('POST');

    const headers = response.request().headers();
    expect(headers['x-csrf-token']).toBeTruthy();
  });
});
