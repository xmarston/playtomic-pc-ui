import { test as base, expect } from '@playwright/test'
import { addCoverageReport } from 'monocart-reporter'

// Extend the base test with coverage collection using automatic fixtures
export const test = base.extend<{ autoTestFixture: string }>({
  autoTestFixture: [
    async ({ page }, use, testInfo) => {
      // Coverage API is chromium only
      const isChromium = testInfo.project.name === 'chromium'

      // Start coverage collection
      if (process.env.COVERAGE && isChromium) {
        await page.coverage.startJSCoverage({
          resetOnNavigation: false,
        })
      }

      await use('autoTestFixture')

      // Stop and add coverage to monocart global report
      if (process.env.COVERAGE && isChromium) {
        const jsCoverage = await page.coverage.stopJSCoverage()
        // Use monocart's addCoverageReport API
        await addCoverageReport(jsCoverage, testInfo)
      }
    },
    {
      scope: 'test',
      auto: true,
    },
  ],
})

export { expect }
