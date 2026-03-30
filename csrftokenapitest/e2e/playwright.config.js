// Playwright Test configuration for the e2e folder
/** @type {import('@playwright/test').PlaywrightTestConfig} */
module.exports = {
  testDir: './tests',
  timeout: 30 * 1000,
  use: {
    headless: true,
    actionTimeout: 10 * 1000,
  },
};
