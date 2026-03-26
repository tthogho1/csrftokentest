/**
 * Shared step definitions used across multiple feature files.
 */
const { Given } = require('@cucumber/cucumber')

// Infrastructure preconditions — assumed to be met when tests run.
Given('the Spring Boot backend is running on localhost:8080', async function () {
  // No-op: backend is assumed to be running before the test suite executes.
})

Given('the Vue.js frontend is running on localhost:5173', async function () {
  // No-op: frontend dev server is assumed to be running before the test suite executes.
})

Given('Spring Security CSRF protection is enabled', async function () {
  // No-op: enabled by SecurityConfig in the running backend.
})

Given('Spring Security CSRF protection is enabled with HttpSessionCsrfTokenRepository', async function () {
  // No-op: PerRequestCsrfFilter stores tokens in HttpSession, fulfilling this precondition.
})

Given('the user navigates to the application URL', async function () {
  await this.page.goto('http://localhost:5173')
  await this.page.waitForLoadState('networkidle')
})
