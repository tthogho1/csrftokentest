const { test, expect } = require('@playwright/test');

test.describe('CSRF security enforcement', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
  });

  test('POST with mismatched CSRF token is rejected (403)', async ({ page }) => {
    // Ensure session exists
    const res = await page.request.get('http://localhost:8080/api/csrf');
    expect(res.status()).toBe(200);

    // Send POST with an intentionally invalid token
    const post = await page.request.post('http://localhost:8080/api/submit', {
      headers: { 'X-CSRF-TOKEN': 'tampered-token' },
      data: { name: 'Bad', birthdate: '1990-01-01' },
    });

    expect(post.status()).toBe(403);
    const body = await post.json();
    expect(body.error).toBeTruthy();
  });

  test('CORS allows requests from localhost:5173 with credentials', async ({ page }) => {
    const origin = 'http://localhost:5173';
    const corsResp = await page.request.get('http://localhost:8080/api/csrf', {
      headers: { Origin: origin },
    });

    expect(corsResp.status()).toBe(200);
    const headers = corsResp.headers();
    // Expect Access-Control-Allow-Origin to match origin (backend config may set this)
    expect(
      headers['access-control-allow-origin'] === origin ||
        headers['access-control-allow-origin'] === '*'
    ).toBeTruthy();
  });
});
