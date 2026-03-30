/**
 * Step definitions for input-validation.feature
 *
 * Covers EARS-009 (name max 50 chars) and EARS-010 (birthdate YYYY-MM-DD format).
 */
const { Given, When, Then } = require('@cucumber/cucumber')
const assert = require('assert')

// ---------------------------------------------------------------------------
// Background
// ---------------------------------------------------------------------------

Given('the Vue.js frontend input form is displayed at {string}', async function (path) {
  await this.page.goto(`http://localhost:5173${path}`)
  await this.page.waitForLoadState('networkidle')
})

// ---------------------------------------------------------------------------
// EARS-009: Name field max 50 characters
// ---------------------------------------------------------------------------

Given('the name input field is visible', async function () {
  await this.page.waitForSelector('#name', { state: 'visible' })
})

When('the user enters a name of exactly {int} characters', async function (length) {
  // Use ASCII 'a' repeated — ensure the filled value is exactly `length` chars.
  const name = 'a'.repeat(length)
  await this.page.fill('#name', name)
  this.enteredName = name
})

Then('the input is accepted', async function () {
  const value = await this.page.inputValue('#name')
  assert.ok(value.length > 0, 'Input field should contain the entered value')
})

Then('no validation error is displayed for the name field', async function () {
  // Trigger blur so the Vue validation runs, then check error visibility.
  await this.page.press('#name', 'Tab')
  const errorVisible = await this.page.isVisible('#name-error')
  assert.ok(!errorVisible, 'No name error should be displayed for valid input')
})

When('the user attempts to enter a name of {int} characters', async function (length) {
  // The HTML maxlength="50" attribute prevents the browser from accepting more than 50 chars.
  const name = 'a'.repeat(length)
  await this.page.fill('#name', name)
  this.attemptedLength = length
})

Then('the name field value is truncated or capped at {int} characters', async function (maxLength) {
  const value = await this.page.inputValue('#name')
  assert.ok(
    value.length <= maxLength,
    `Name field should be at most ${maxLength} characters but got ${value.length}`
  )
})

Then('the excess characters are not accepted', async function () {
  const value = await this.page.inputValue('#name')
  assert.ok(value.length <= 50, `Excess characters should not be accepted; got ${value.length} chars`)
})

// ---------------------------------------------------------------------------
// EARS-010: Birthdate YYYY-MM-DD format validation
// ---------------------------------------------------------------------------

Given('the birthdate input field is visible', async function () {
  await this.page.waitForSelector('#birthdate', { state: 'visible' })
})

When('the user enters {string} as the birthdate', async function (date) {
  await this.page.fill('#birthdate', date)
  this.enteredDate = date
  // Trigger blur to run Vue validation
  await this.page.press('#birthdate', 'Tab')
})

Then('the birthdate passes format validation', async function () {
  const errorVisible = await this.page.isVisible('#birthdate-error')
  assert.ok(!errorVisible, 'No birthdate error should be shown for a valid YYYY-MM-DD date')
})

Then('no validation error is displayed for the birthdate field', async function () {
  const errorVisible = await this.page.isVisible('#birthdate-error')
  assert.ok(!errorVisible, 'Birthdate error element should not be visible')
})

Then('a validation error is displayed for the birthdate field', async function () {
  // Click submit to force validation if the error hasn't appeared after blur.
  await this.page.click('#submit-btn')
  await this.page.waitForSelector('#birthdate-error', { state: 'visible', timeout: 5000 })
  const errorVisible = await this.page.isVisible('#birthdate-error')
  assert.ok(errorVisible, 'A birthdate validation error should be displayed for an invalid date')
})

Then('the error indicates the required format is YYYY-MM-DD', async function () {
  const errorText = await this.page.textContent('#birthdate-error')
  assert.ok(
    errorText && errorText.includes('YYYY-MM-DD'),
    `Error message should mention YYYY-MM-DD format but got: "${errorText}"`
  )
})
