/**
 * Step definitions for csrf-token-management.feature
 * Covers EARS-001, EARS-002, EARS-003, EARS-009.
 */
const { Given, When, Then } = require('@cucumber/cucumber')
const assert = require('assert')

// ── EARS-001: New session triggers CSRF token generation ──────────────────

Given('no active HTTP session exists for the client', async function () {
  // Fresh browser context from Before hook — no session cookies.
})

When('a new HTTP session is established', async function () {
  // First GET to the backend creates an HttpSession and generates the token.
  this.firstResponse = await this.page.request.get('http://localhost:8080/api/secure/data')
})

Then('the system shall generate a CSRF token', async function () {
  const token = this.firstResponse.headers()['x-csrf-token']
  assert.ok(token && token.length > 0, 'X-CSRF-TOKEN header should be present on first GET response')
  this.generatedToken = token
})

Then('the CSRF token shall be stored in the HttpSession', async function () {
  // Verify the token persists in the session: a second GET without a new context
  // returns the SAME token (HttpSessionCsrfTokenRepository keeps it until session expires).
  const res2 = await this.page.request.get('http://localhost:8080/api/secure/data')
  const token2 = res2.headers()['x-csrf-token']
  assert.strictEqual(token2, this.generatedToken,
    'Same session should return the same CSRF token on consecutive GETs')
})

// ── EARS-002: Response always includes X-CSRF-TOKEN header ───────────────

Given('a valid HTTP session with a CSRF token exists', async function () {
  this.getResponse = await this.page.request.get('http://localhost:8080/api/secure/data')
  assert.strictEqual(this.getResponse.status(), 200)
})

When('the system sends an HTTP response to the client', async function () {
  // getResponse captured in Given step above.
})

Then('the response shall include the {string} header', async function (headerName) {
  const value = this.getResponse.headers()[headerName.toLowerCase()]
  assert.ok(value && value.length > 0,
    `Response should include the "${headerName}" header`)
  this.tokenFromHeader = value
})

Then('the header value shall match the token stored in the HttpSession', async function () {
  // Send a second request and verify the token is the same (session-bound).
  const res2 = await this.page.request.get('http://localhost:8080/api/secure/data')
  const token2 = res2.headers()['x-csrf-token']
  assert.strictEqual(token2, this.tokenFromHeader,
    'Token in header should match the session-stored token on repeated GETs')
})

// ── EARS-003: Client stores token in sessionStorage ───────────────────────

Given('the client receives an HTTP response', async function () {
  await this.page.goto('http://localhost:5173')
  await this.page.waitForLoadState('networkidle')
})

When('the response contains the {string} header', async function (_headerName) {
  // The onMounted GET in App.vue triggers the response interceptor;
  // wait for the interceptor to write to sessionStorage.
  await this.page.waitForFunction(
    () => sessionStorage.getItem('csrf-token') !== null,
    { timeout: 5000 }
  )
})

Then('the system shall store the token value in sessionStorage under the key {string}', async function (key) {
  const stored = await this.page.evaluate((k) => sessionStorage.getItem(k), key)
  assert.ok(stored && stored.length > 0,
    `sessionStorage["${key}"] should contain the CSRF token`)
})

When('the response does not contain the {string} header', async function (_headerName) {
  // Clear sessionStorage, then intercept the GET response to strip the CSRF header.
  await this.page.evaluate(() => sessionStorage.removeItem('csrf-token'))
  await this.page.route('**/api/secure/data', async (route) => {
    const response = await route.fetch()
    const headers = response.headers()
    delete headers['x-csrf-token']
    await route.fulfill({ response, headers })
  })
  await this.page.evaluate(() => fetch('http://localhost:8080/api/secure/data', { credentials: 'include' }))
  await this.page.waitForTimeout(300)
})

Then('the sessionStorage {string} entry shall not be updated', async function (key) {
  const stored = await this.page.evaluate((k) => sessionStorage.getItem(k), key)
  assert.strictEqual(stored, null,
    `sessionStorage["${key}"] should remain null when no X-CSRF-TOKEN header is present`)
})

// ── EARS-009: Token persists in sessionStorage after page reload ──────────

Given('a CSRF token is stored in sessionStorage', async function () {
  await this.page.goto('http://localhost:5173')
  await this.page.waitForLoadState('networkidle')
  await this.page.waitForFunction(() => sessionStorage.getItem('csrf-token') !== null, { timeout: 5000 })
  this.tokenBeforeReload = await this.page.evaluate(() => sessionStorage.getItem('csrf-token'))
  assert.ok(this.tokenBeforeReload, 'Pre-condition: token must be in sessionStorage before reload')
})

When('the user reloads the page', async function () {
  await this.page.reload()
  await this.page.waitForLoadState('networkidle')
})

Then('the CSRF token shall remain in sessionStorage', async function () {
  // sessionStorage persists across reloads within the same tab.
  const tokenAfterReload = await this.page.evaluate(() => sessionStorage.getItem('csrf-token'))
  assert.ok(tokenAfterReload && tokenAfterReload.length > 0,
    'CSRF token should persist in sessionStorage after page reload')
})

Then('the next state-changing request shall include the token without requiring re-acquisition', async function () {
  const tokenInStorage = await this.page.evaluate(() => sessionStorage.getItem('csrf-token'))
  // Click POST button; if the token is correctly sent the response will be 200 (not 403).
  const [response] = await Promise.all([
    this.page.waitForResponse(resp => resp.url().includes('/api/secure/data') && resp.request().method() === 'POST'),
    this.page.click('#btn-post'),
  ])
  assert.strictEqual(response.status(), 200,
    `POST after reload should succeed using the persisted token "${tokenInStorage}"`)
})
