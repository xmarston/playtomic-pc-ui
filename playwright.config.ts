import { defineConfig, devices } from '@playwright/test'

const isCI = !!process.env.CI
const collectCoverage = !!process.env.COVERAGE

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: 2,
  workers: isCI ? 1 : undefined,
  reporter: collectCoverage
    ? [
        ['monocart-reporter', {
          name: 'Playwright Coverage Report',
          outputFile: './coverage/report.html',
          coverage: {
            entryFilter: (entry: { url: string }) => entry.url.includes('localhost:3000'),
            sourceFilter: (sourcePath: string) => sourcePath.includes('src/'),
            reports: ['v8', 'html', 'lcovonly'],
            lcov: true,
            outputDir: './coverage',
          },
        }],
      ]
    : [['html', { open: 'never' }], ['line']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // Use dev server for coverage collection (V8 coverage works better with dev mode)
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !isCI,
    timeout: 120000,
  },
})
