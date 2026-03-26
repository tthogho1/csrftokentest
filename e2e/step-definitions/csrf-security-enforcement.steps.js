/**
 * Step definitions for csrf-security-enforcement.feature
 *
 * Covers EARS-007 (token mismatch → 403) and EARS-008 (CORS from localhost:5173).
 */
const { Given, When, Then } = require('@cucumber/cucumber')
const assert = require('assert')

// ---------------------------------------------------------------------------
// EARS-007: POST request with mismatched CSRF token is rejected
// ---------------------------------------------------------------------------

Given('the HTTP session contains CSRF token {string}', async function (_token) {
  // Establish a real session by calling GET /api/csrf.
  // The actual session token will be whatever the server generated; we will
  // intentionally send a different token in the When step to trigger a 403.
  const res = await this.page.request.get('http://localhost:8080/api/csrf')
  assert.strictEqual(res.status(), 200, 'GET /api/csrf should succeed to establish session')
  this.realSessionToken = (await res.json()).token
})

When('a POST request arrives at \\/api\\/submit with X-CSRF-TOKEN header {string}', async function (invalidToken) {
  // Send the explicitly specified (tampered) token rather than the real session token.
  this.postResponse = await this.page.request.post('http://localhost:8080/api/submit', {
    headers: { 'X-CSRF-TOKEN': invalidToken },
    data: { name: 'Test', birthdate: '1990-01-01' }
  })
})

Then('Spring Security rejects the request', async function () {
  assert.strictEqual(this.postResponse.status(), 403, 'Server should reject with 403')
})

Then('an error response is returned', async function () {
  const body = await this.postResponse.json()
  assert.ok(body.error && body.error.length > 0, 'Response body should contain an "error" field')
})

Then('the HTTP response status code is {int}', async function (statusCode) {
  assert.strictEqual(this.postResponse.status(), statusCode, `Expected HTTP status ${statusCode}`)
})

// ---------------------------------------------------------------------------
// EARS-007 (missing header variant)
// ---------------------------------------------------------------------------

Given('the HTTP session contains a valid CSRF token', async function () {
  const res = await this.page.request.get('http://localhost:8080/api/csrf')
  assert.strictEqual(res.status(), 200, 'GET /api/csrf should succeed to establish session')
})

When('a POST request arrives at \\/api\\/submit without the X-CSRF-TOKEN header', async function () {
  // Omit the X-CSRF-TOKEN header entirely.
  this.postResponse = await this.page.request.post('http://localhost:8080/api/submit', {
    data: { name: 'Test', birthdate: '1990-01-01' }
  })
})

// ---------------------------------------------------------------------------
// EARS-008: Cross-origin requests from localhost:5173 with credentials are permitted
// ---------------------------------------------------------------------------

Given('the Spring Security CORS configuration allows origin {string}', async function (origin) {
  this.allowedOrigin = origin
})

Given('the Axios client is configured with withCredentials set to true', async function () {
  // Verified by the frontend Axios configuration; no runtime action needed.
})

When('a request originates from {string} with credentials', async function (origin) {
  this.corsResponse = await this.page.request.get('http://localhost:8080/api/csrf', {
    headers: { Origin: origin }
  })
})

Then('the CORS policy permits the request', async function () {
  assert.strictEqual(this.corsResponse.status(), 200, 'CORS preflight/request should be permitted')
})

Then('the response includes {string}', async function (headerLine) {
  const separatorIndex = headerLine.indexOf(': ')
  const headerName = headerLine.substring(0, separatorIndex).toLowerCase()
  const expectedValue = headerLine.substring(separatorIndex + 2)

  const headers = this.corsResponse.headers()
  assert.strictEqual(
    headers[headerName],
    expectedValue,
    `Expected response header "${headerName}" to be "${expectedValue}" but got "${headers[headerName]}"`
  )
})
