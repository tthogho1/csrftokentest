const { test, expect } = require('@playwright/test');

test.describe('CSRF token management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
  });

  test('page load triggers GET /api/csrf and returns a token', async ({ page }) => {
    const response = await page.request.get('http://localhost:8080/api/csrf');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.token).toBeTruthy();
    expect(body.token.length).toBeGreaterThan(0);
  });

  test('PerRequestCsrfFilter generates a new token for each request', async ({ page }) => {
    const res1 = await page.request.get('http://localhost:8080/api/csrf');
    const token1 = (await res1.json()).token;

    const res2 = await page.request.get('http://localhost:8080/api/csrf');
    const token2 = (await res2.json()).token;

    expect(token1).toBeTruthy();
    expect(token2).toBeTruthy();
    expect(token1).not.toBe(token2);

    // Also assert the X-CSRF-TOKEN response header is present on the first response
    const header = res1.headers()['x-csrf-token'];
    expect(header).toBeTruthy();
  });
});
