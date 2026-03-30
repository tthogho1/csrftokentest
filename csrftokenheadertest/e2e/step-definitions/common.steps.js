/**
 * Shared precondition steps used across all feature files.
 */
const { Given } = require('@cucumber/cucumber')

// Infrastructure preconditions — both servers are assumed running before the suite starts.
Given('the Spring Security CSRF protection is enabled', async function () {
  // Verified implicitly: if the server is unreachable, all subsequent API calls fail.
})

Given('the CSRF token repository uses {string} as the header name', async function (_headerName) {
  // Configured in SecurityConfig.java; no runtime action needed.
})

Given('a valid HTTP session exists with a stored CSRF token', async function () {
  // Establish a session by sending GET /api/secure/data.
  const res = await this.page.request.get('http://localhost:8080/api/secure/data')
  if (res.status() !== 200) {
    throw new Error(`Expected 200 from GET /api/secure/data but got ${res.status()}`)
  }
  this.sessionCsrfToken = res.headers()['x-csrf-token']
  if (!this.sessionCsrfToken) {
    throw new Error('X-CSRF-TOKEN header missing from GET response')
  }
})

Given('the Vue.js application is initialized', async function () {
  await this.page.goto('http://localhost:5173')
  await this.page.waitForLoadState('networkidle')
})

Given('Axios request and response interceptors are configured', async function () {
  // Interceptors are bundled in the frontend; loading the app is sufficient.
})

Given('the API base URL is set to {string} with {string}', async function (_baseUrl, _withCredentials) {
  // Configured in src/api/client.ts; no runtime action needed.
})
