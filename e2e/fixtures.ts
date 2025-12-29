import { test as base, expect } from '@playwright/test'

// Extend the base test with coverage collection
export const test = base.extend({
  page: async ({ page }, use) => {
    // Start JS coverage collection
    if (process.env.COVERAGE) {
      await page.coverage.startJSCoverage({ resetOnNavigation: false })
    }

    await use(page)

    // Stop and get coverage data (monocart will pick this up)
    if (process.env.COVERAGE) {
      await page.coverage.stopJSCoverage()
    }
  },
})

export { expect }
