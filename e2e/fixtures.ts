import { test as base, expect } from '@playwright/test'

// Extend the base test with coverage collection
export const test = base.extend({
  page: async ({ page }, use, testInfo) => {
    // Start JS coverage collection
    if (process.env.COVERAGE) {
      await page.coverage.startJSCoverage({ resetOnNavigation: false })
    }

    await use(page)

    // Stop and attach coverage data for monocart to pick up
    if (process.env.COVERAGE) {
      const coverage = await page.coverage.stopJSCoverage()
      // Filter to only include source files from localhost:3000
      // This prevents OOM from massive node_modules coverage
      const filteredCoverage = coverage.filter(
        (entry) => entry.url.includes('localhost:3000') && !entry.url.includes('node_modules')
      )
      // Attach coverage data as JSON for monocart-reporter
      await testInfo.attach('coverage', {
        body: JSON.stringify(filteredCoverage),
        contentType: 'application/json',
      })
    }
  },
})

export { expect }
