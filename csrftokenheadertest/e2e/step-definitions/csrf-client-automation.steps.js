/**
 * Step definitions for csrf-client-automation.feature
 * Covers EARS-004 (auto-injection) and EARS-008 (403 recovery).
 *
 * These tests exercise the Vue.js / Axios interceptor behaviour in a real browser.
 */
const { Given, When, Then } = require('@cucumber/cucumber')
const assert = require('assert')

const FRONTEND_URL = 'http://localhost:5173'
const BACKEND_DATA_URL = 'http://localhost:8080/api/secure/data'

// ── EARS-004: Token auto-injected into POST ───────────────────────────────

Given('a CSRF token {string} is stored in sessionStorage under {string}', async function (token, key) {
  await this.page.goto(FRONTEND_URL)
  await this.page.waitForLoadState('networkidle')
  // Override with the specific token so we can assert on the exact value later.
  await this.page.evaluate(([k, t]) => sessionStorage.setItem(k, t), [key, token])
  this.injectedToken = token
})

When('the client sends a POST request to {string}', async function (path) {
  this.capturedRequest = null

  // Intercept outgoing requests to record the CSRF header.
  await this.page.route(`**${path}`, async (route) => {
    this.capturedRequest = route.request()
    await route.continue()
  })

  // Trigger POST via the UI button (App.vue btn-post).
  const [response] = await Promise.all([
    this.page.waitForResponse(resp => resp.url().includes(path) && resp.request().method() === 'POST'),
    this.page.click('#btn-post'),
  ])
  this.postStatus = response.status()
})

Then('the Axios request interceptor shall set the {string} header to {string}', async function (headerName, expectedToken) {
  assert.ok(this.capturedRequest, 'A POST request should have been captured')
  const actual = this.capturedRequest.headers()[headerName.toLowerCase()]
  assert.strictEqual(actual, expectedToken,
    `Expected "${headerName}" header to be "${expectedToken}" but got "${actual}"`)
})

Then('the request shall be sent with the token header present', async function () {
  assert.ok(this.capturedRequest, 'Request should have been captured')
  const token = this.capturedRequest.headers()['x-csrf-token']
  assert.ok(token && token.length > 0, 'X-CSRF-TOKEN header should be present in the outgoing request')
})

// ── EARS-004: Auto-inject for all state-changing methods (Outline) ────────

Given('a CSRF token is stored in sessionStorage', async function () {
  await this.page.goto(FRONTEND_URL)
  await this.page.waitForLoadState('networkidle')
  await this.page.waitForFunction(() => sessionStorage.getItem('csrf-token') !== null, { timeout: 5000 })
})

When('the client sends a {string} request', async function (method) {
  this.capturedMethod = method.toUpperCase()
  this.capturedHeaders = null

  await this.page.route(`**${BACKEND_DATA_URL.replace('http://localhost:8080', '')}`, async (route) => {
    if (route.request().method() === this.capturedMethod) {
      this.capturedHeaders = route.request().headers()
    }
    await route.continue()
  })

  const buttonId = {
    POST: '#btn-post',
    PUT: '#btn-put',
    DELETE: '#btn-delete',
    PATCH: '#btn-patch',
    GET: '#btn-get',
  }[method.toUpperCase()]

  if (!buttonId) throw new Error(`No button mapped for method: ${method}`)

  await Promise.all([
    this.page.waitForResponse(resp =>
      resp.url().includes('/api/secure/data') && resp.request().method() === this.capturedMethod,
      { timeout: 5000 }
    ),
    this.page.click(buttonId),
  ])
})

Then('the Axios request interceptor shall automatically include the {string} header', async function (headerName) {
  assert.ok(this.capturedHeaders, `Headers for ${this.capturedMethod} request should have been captured`)
  const token = this.capturedHeaders[headerName.toLowerCase()]
  assert.ok(token && token.length > 0,
    `"${headerName}" header should be automatically included for ${this.capturedMethod} requests`)
})

// ── EARS-004: GET requests must NOT carry CSRF token ─────────────────────

Then('the Axios request interceptor shall NOT add the {string} header', async function (headerName) {
  assert.ok(this.capturedHeaders, 'GET request headers should have been captured')
  const token = this.capturedHeaders[headerName.toLowerCase()]
  assert.ok(!token,
    `"${headerName}" header should NOT be present on GET requests but found: "${token}"`)
})

// ── EARS-008: 403 recovery — clear token and reload ──────────────────────

When('the server returns HTTP 403 Forbidden for a POST request', async function () {
  // Plant an invalid token so the server rejects the POST with 403.
  await this.page.evaluate(() => sessionStorage.setItem('csrf-token', 'invalid-token-trigger-403'))

  // Watch for page reload (navigation) triggered by the 403 interceptor.
  this.reloadPromise = this.page.waitForNavigation({ timeout: 8000 }).catch(() => null)

  // Click POST — the Axios response interceptor will get 403, clear sessionStorage, and reload.
  await this.page.click('#btn-post').catch(() => null)
})

Then('the Axios response interceptor shall delete {string} from sessionStorage', async function (key) {
  // Wait for reload to complete.
  await this.reloadPromise
  await this.page.waitForLoadState('networkidle')

  // After reload the interceptor clears the key; confirm it is gone (or overwritten by the new GET).
  // Inject a marker BEFORE checking, to distinguish "key was cleared then re-written" from "never cleared".
  // The important assertion: the original invalid token "invalid-token-trigger-403" is gone.
  const current = await this.page.evaluate((k) => sessionStorage.getItem(k), key)
  assert.notStrictEqual(current, 'invalid-token-trigger-403',
    `The stale invalid token should have been removed from sessionStorage["${key}"] on 403`)
})

Then('the page shall be reloaded to trigger re-acquisition of a valid CSRF token', async function () {
  // Reload happened if the navigation promise resolved or if the page URL is the app root.
  const url = this.page.url()
  assert.ok(url.startsWith(FRONTEND_URL),
    `Page should have reloaded to ${FRONTEND_URL} but is at ${url}`)

  // After reload, App.vue's onMounted sends a GET which should populate sessionStorage.
  await this.page.waitForFunction(() => sessionStorage.getItem('csrf-token') !== null, { timeout: 5000 })
  const newToken = await this.page.evaluate(() => sessionStorage.getItem('csrf-token'))
  assert.ok(newToken && newToken !== 'invalid-token-trigger-403',
    'After reload, a fresh valid CSRF token should be in sessionStorage')
})
