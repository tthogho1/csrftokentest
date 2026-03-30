/**
 * Cucumber World: fresh Playwright browser context per scenario.
 * Isolates session cookies and sessionStorage between scenarios.
 */
const { setWorldConstructor, Before, After } = require('@cucumber/cucumber')
const { chromium } = require('playwright')

class CustomWorld {
  constructor() {
    this.browser = null
    this.context = null
    this.page = null
  }
}

setWorldConstructor(CustomWorld)

Before(async function () {
  this.browser = await chromium.launch({ headless: true })
  this.context = await this.browser.newContext()
  this.page = await this.context.newPage()
})

After(async function () {
  if (this.browser) {
    await this.browser.close()
  }
})
