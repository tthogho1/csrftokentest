/**
 * Step definitions for form-submission-workflow.feature
 *
 * Covers EARS-005 (POST /api/submit) and EARS-006 (POST /api/confirm).
 */
const { Given, When, Then } = require('@cucumber/cucumber')
const assert = require('assert')

// ---------------------------------------------------------------------------
// Background
// ---------------------------------------------------------------------------

Given('a valid CSRF token is present in the HTTP session', async function () {
  // Navigate to the app; InputForm.vue calls GET /api/csrf on mount (EARS-001),
  // which seeds the session and the client-side token cache.
  await this.page.goto('http://localhost:5173')
  await this.page.waitForLoadState('networkidle')
})

// ---------------------------------------------------------------------------
// EARS-005: User submits input form
// ---------------------------------------------------------------------------

Given('the user is on the input form screen at {string}', async function (path) {
  await this.page.goto(`http://localhost:5173${path}`)
  await this.page.waitForLoadState('networkidle')
})

Given('the user has entered name {string}', async function (name) {
  await this.page.fill('#name', name)
})

Given('the user has entered birthdate {string}', async function (birthdate) {
  await this.page.fill('#birthdate', birthdate)
})

When('the user submits the input form', async function () {
  const [response] = await Promise.all([
    this.page.waitForResponse(resp => resp.url().includes('/api/submit')),
    this.page.click('#submit-btn')
  ])
  this.submitResponse = response
})

Then('a POST request is sent to \\/api\\/submit', async function () {
  assert.ok(this.submitResponse.url().includes('/api/submit'), 'URL should include /api/submit')
  assert.strictEqual(this.submitResponse.request().method(), 'POST', 'Method should be POST')
})

Then('the request includes the X-CSRF-TOKEN header', async function () {
  const headers = this.submitResponse.request().headers()
  assert.ok(
    headers['x-csrf-token'] && headers['x-csrf-token'].length > 0,
    'X-CSRF-TOKEN header must be present on the request'
  )
})

Then('the response body contains:', async function (dataTable) {
  const responseBody = await (this.confirmResponse
    ? this.confirmResponse.json()
    : this.submitResponse.json())

  const rows = dataTable.hashes()
  for (const row of rows) {
    assert.strictEqual(
      responseBody[row.field],
      row.value,
      `Expected field "${row.field}" to equal "${row.value}" but got "${responseBody[row.field]}"`
    )
  }
})

// ---------------------------------------------------------------------------
// EARS-006: User confirms submission on confirmation screen
// ---------------------------------------------------------------------------

Given('the user is on the confirmation screen at {string}', async function (_path) {
  // Go through the full submit flow to land on the confirmation screen with session data.
  await this.page.goto('http://localhost:5173')
  await this.page.waitForLoadState('networkidle')

  await this.page.fill('#name', '東郷智昭')
  await this.page.fill('#birthdate', '1980-01-01')

  await Promise.all([
    this.page.waitForURL('**/confirm'),
    this.page.click('#submit-btn')
  ])
  await this.page.waitForLoadState('networkidle')
})

Given('the confirmation screen displays the submitted name and birthdate', async function () {
  const bodyText = await this.page.textContent('body')
  assert.ok(bodyText.includes('東郷智昭'), 'Confirmation screen should display the submitted name')
  assert.ok(bodyText.includes('1980-01-01'), 'Confirmation screen should display the submitted birthdate')
})

When('the user clicks the confirm submit button', async function () {
  const [response] = await Promise.all([
    this.page.waitForResponse(resp => resp.url().includes('/api/confirm')),
    this.page.click('#confirm-btn')
  ])
  this.confirmResponse = response
})

Then('a POST request is sent to \\/api\\/confirm', async function () {
  assert.ok(this.confirmResponse.url().includes('/api/confirm'), 'URL should include /api/confirm')
  assert.strictEqual(this.confirmResponse.request().method(), 'POST', 'Method should be POST')
})

Then('the user is redirected to {string}', async function (path) {
  await this.page.waitForURL(`**${path}`)
  const currentUrl = this.page.url()
  assert.ok(
    currentUrl.endsWith(path) || currentUrl.includes(`localhost:5173${path}`),
    `Expected redirect to ${path} but current URL is ${currentUrl}`
  )
})
