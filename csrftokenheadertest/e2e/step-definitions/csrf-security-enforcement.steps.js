/**
 * Step definitions for csrf-security-enforcement.feature
 * Covers EARS-005, EARS-006, EARS-007.
 */
const { Given, When, Then } = require('@cucumber/cucumber')
const assert = require('assert')

// ── EARS-005: Valid token accepted ────────────────────────────────────────

Given('the client has a valid CSRF token', async function () {
  const res = await this.page.request.get('http://localhost:8080/api/secure/data')
  this.validToken = res.headers()['x-csrf-token']
  assert.ok(this.validToken, 'GET should return a valid X-CSRF-TOKEN header')
})

When('the client sends a POST request with the {string} header set to the valid token', async function (headerName) {
  this.postResponse = await this.page.request.post('http://localhost:8080/api/secure/data', {
    headers: { [headerName]: this.validToken },
    data: { message: 'test' },
  })
})

Then('the system shall compare the header value with the HttpSession CSRF token', async function () {
  // A 200 response proves the token matched the session; a 403 would indicate mismatch.
  assert.strictEqual(this.postResponse.status(), 200,
    'Valid token should be accepted; comparison result is success')
})

Then('the request shall be processed successfully', async function () {
  assert.strictEqual(this.postResponse.status(), 200, 'Request with valid token should return 200')
  const body = await this.postResponse.json()
  assert.strictEqual(body.status, 'ok', 'Response body should have status "ok"')
})

// ── EARS-006: Mismatched / tampered token returns 403 ─────────────────────

Given('the HttpSession contains a CSRF token {string}', async function (_tokenLabel) {
  // Establish a real session; we will send a deliberately wrong token in the When step.
  const res = await this.page.request.get('http://localhost:8080/api/secure/data')
  this.realSessionToken = res.headers()['x-csrf-token']
  assert.ok(this.realSessionToken, 'Session token must be established')
})

When('the client sends a POST request with {string} header set to {string}', async function (headerName, invalidToken) {
  this.postResponse = await this.page.request.post('http://localhost:8080/api/secure/data', {
    headers: { [headerName]: invalidToken },
    data: { message: 'test' },
  })
})

Then('the system shall return HTTP status {int} Forbidden', async function (statusCode) {
  assert.strictEqual(this.postResponse.status(), statusCode,
    `Expected HTTP ${statusCode} but got ${this.postResponse.status()}`)
})

Then('the response body shall contain {string}', async function (text) {
  const body = await this.postResponse.text()
  assert.ok(body.includes(text),
    `Response body should contain "${text}" but got: ${body}`)
})

Given('a CSRF token was previously issued to the client', async function () {
  const res = await this.page.request.get('http://localhost:8080/api/secure/data')
  this.originalToken = res.headers()['x-csrf-token']
  assert.ok(this.originalToken, 'Original token must be issued')
})

When('the client sends a POST request with a tampered {string} header value', async function (headerName) {
  const tampered = this.originalToken.slice(0, -4) + 'XXXX'  // last 4 chars replaced
  this.postResponse = await this.page.request.post('http://localhost:8080/api/secure/data', {
    headers: { [headerName]: tampered },
    data: { message: 'tampered' },
  })
})

// ── EARS-007: Missing token returns 403 ──────────────────────────────────

Given('the client has not acquired a CSRF token', async function () {
  // Do NOT call GET /api/secure/data first — no session, no token.
})

When('the client sends a POST request without the {string} header', async function (_headerName) {
  // Omit X-CSRF-TOKEN entirely.
  this.postResponse = await this.page.request.post('http://localhost:8080/api/secure/data', {
    data: { message: 'no-token' },
  })
})

When('the client sends a {string} request without the {string} header', async function (method, _headerName) {
  const url = 'http://localhost:8080/api/secure/data'
  const opts = { data: { message: 'no-token' } }

  switch (method.toUpperCase()) {
    case 'POST':
      this.postResponse = await this.page.request.post(url, opts)
      break
    case 'PUT':
      this.postResponse = await this.page.request.put(url, opts)
      break
    case 'DELETE':
      this.postResponse = await this.page.request.delete(url)
      break
    case 'PATCH':
      this.postResponse = await this.page.request.patch(url, opts)
      break
    default:
      throw new Error(`Unsupported method: ${method}`)
  }
})
