import { test, expect, Page } from '@playwright/test'

// Mock data for API responses
const mockStats = {
  totalViews: 1250,
  uniqueSessions: 847,
  todayViews: 42,
  weekViews: 312,
  topPages: [
    { path: '/en', count: 500 },
    { path: '/es', count: 350 },
    { path: '/fr', count: 200 },
  ],
  topReferrers: [
    { referrer: 'google.com', count: 400 },
    { referrer: 'direct', count: 300 },
    { referrer: 'twitter.com', count: 150 },
  ],
  browsers: [
    { browser: 'Chrome', count: 600 },
    { browser: 'Firefox', count: 300 },
    { browser: 'Safari', count: 200 },
  ],
  userAgents: [
    { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0', count: 400 },
    { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Firefox/121.0', count: 200 },
  ],
}

const mockViews = {
  data: [
    { date: '2024-01-01', views: 45, uniqueVisitors: 30 },
    { date: '2024-01-02', views: 52, uniqueVisitors: 38 },
    { date: '2024-01-03', views: 38, uniqueVisitors: 25 },
    { date: '2024-01-04', views: 61, uniqueVisitors: 42 },
    { date: '2024-01-05', views: 55, uniqueVisitors: 40 },
  ],
}

async function setupApiMocks(page: Page, authValid = true) {
  await page.route('**/api/analytics/stats*', async (route) => {
    const authHeader = route.request().headers()['authorization']
    if (!authHeader || authHeader !== 'Basic YWRtaW46cGFzc3dvcmQ=') {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Unauthorized' }),
      })
      return
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockStats),
    })
  })

  await page.route('**/api/analytics/views*', async (route) => {
    const authHeader = route.request().headers()['authorization']
    if (!authHeader || authHeader !== 'Basic YWRtaW46cGFzc3dvcmQ=') {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Unauthorized' }),
      })
      return
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockViews),
    })
  })
}

async function login(page: Page, username = 'admin', password = 'password') {
  // Wait for login form to be ready
  await page.waitForSelector('form')

  // Get inputs by their type within the form
  const usernameInput = page.locator('input[type="text"]')
  const passwordInput = page.locator('input[type="password"]')
  const loginButton = page.locator('button[type="submit"]')

  await usernameInput.fill(username)
  await passwordInput.fill(password)
  await loginButton.click()
}

test.describe('Analytics Dashboard - Login', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page)
    await page.goto('/en/analytics')
  })

  test('should render login form', async ({ page }) => {
    await page.waitForSelector('form')
    await expect(page.getByText(/analytics login/i)).toBeVisible()
    await expect(page.locator('input[type="text"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should show error on invalid credentials', async ({ page }) => {
    await login(page, 'wrong', 'wrong')
    await expect(page.getByText(/invalid credentials/i)).toBeVisible()
  })

  test('should successfully login with valid credentials', async ({ page }) => {
    await login(page)

    // Wait for dashboard to load
    await expect(page.getByText(/analytics dashboard/i)).toBeVisible({ timeout: 10000 })
  })

  test('should require username field', async ({ page }) => {
    await page.waitForSelector('form')
    const passwordInput = page.locator('input[type="password"]')
    await passwordInput.fill('password')

    const loginButton = page.locator('button[type="submit"]')
    await loginButton.click()

    // Form should not submit, username field should be marked as required
    const usernameInput = page.locator('input[type="text"]')
    await expect(usernameInput).toHaveAttribute('required', '')
  })

  test('should require password field', async ({ page }) => {
    await page.waitForSelector('form')
    const usernameInput = page.locator('input[type="text"]')
    await usernameInput.fill('admin')

    const loginButton = page.locator('button[type="submit"]')
    await loginButton.click()

    // Form should not submit, password field should be marked as required
    const passwordInput = page.locator('input[type="password"]')
    await expect(passwordInput).toHaveAttribute('required', '')
  })
})

test.describe('Analytics Dashboard - After Login', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page)
    await page.goto('/en/analytics')
    await login(page)
    // Wait for dashboard to load
    await expect(page.getByText(/analytics dashboard/i)).toBeVisible({ timeout: 10000 })
  })

  test('should display dashboard title', async ({ page }) => {
    await expect(page.getByText(/analytics dashboard/i)).toBeVisible()
  })

  test('should display stats cards with correct values', async ({ page }) => {
    // Total Views
    await expect(page.getByText('1,250')).toBeVisible()
    // Unique Visitors
    await expect(page.getByText('847')).toBeVisible()
    // Today
    await expect(page.getByText('42')).toBeVisible()
    // Last 7 Days
    await expect(page.getByText('312')).toBeVisible()
  })

  test('should display top pages section', async ({ page }) => {
    await expect(page.getByText(/top pages/i)).toBeVisible()
    await expect(page.getByText('/en')).toBeVisible()
    await expect(page.getByText('/es')).toBeVisible()
    await expect(page.getByText('/fr')).toBeVisible()
  })

  test('should display top referrers section', async ({ page }) => {
    await expect(page.getByText(/top referrers/i)).toBeVisible()
    await expect(page.getByText('google.com')).toBeVisible()
    await expect(page.getByText('direct')).toBeVisible()
    await expect(page.getByText('twitter.com')).toBeVisible()
  })

  test('should display browsers section', async ({ page }) => {
    await expect(page.getByText(/browsers/i).first()).toBeVisible()
  })

  test('should display user agents table', async ({ page }) => {
    await expect(page.getByText(/user agents/i)).toBeVisible()
    // Check user agent strings are visible
    await expect(page.getByText(/Chrome\/120.0.0.0/)).toBeVisible()
    await expect(page.getByText(/Firefox\/121.0/)).toBeVisible()
  })

  test('should display page views chart section', async ({ page }) => {
    await expect(page.getByText(/page views/i).first()).toBeVisible()
  })
})

test.describe('Analytics Dashboard - Date Range Selector', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page)
    await page.goto('/en/analytics')
    await login(page)
    await expect(page.getByText(/analytics dashboard/i)).toBeVisible({ timeout: 10000 })
  })

  test('should display date preset buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: /last 7 days/i }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /last 30 days/i }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /last 90 days/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /custom/i })).toBeVisible()
  })

  test('should have 30 days selected by default', async ({ page }) => {
    const thirtyDaysButton = page.getByRole('button', { name: /last 30 days/i }).first()
    await expect(thirtyDaysButton).toHaveClass(/bg-blue-500/)
  })

  test('should switch to 7 days preset', async ({ page }) => {
    const sevenDaysButton = page.getByRole('button', { name: /last 7 days/i }).first()
    await sevenDaysButton.click()
    await expect(sevenDaysButton).toHaveClass(/bg-blue-500/)
  })

  test('should switch to 90 days preset', async ({ page }) => {
    const ninetyDaysButton = page.getByRole('button', { name: /last 90 days/i })
    await ninetyDaysButton.click()
    await expect(ninetyDaysButton).toHaveClass(/bg-blue-500/)
  })

  test('should show custom date picker when Custom is clicked', async ({ page }) => {
    const customButton = page.getByRole('button', { name: /custom/i })
    await customButton.click()

    // Date inputs should appear
    const dateInputs = page.locator('input[type="date"]')
    await expect(dateInputs).toHaveCount(2)

    // Apply button should appear
    await expect(page.getByRole('button', { name: /apply/i })).toBeVisible()
  })

  test('should be able to enter custom date range', async ({ page }) => {
    const customButton = page.getByRole('button', { name: /custom/i })
    await customButton.click()

    const dateInputs = page.locator('input[type="date"]')
    const startDateInput = dateInputs.first()
    const endDateInput = dateInputs.nth(1)

    await startDateInput.fill('2024-01-01')
    await endDateInput.fill('2024-01-31')

    await expect(startDateInput).toHaveValue('2024-01-01')
    await expect(endDateInput).toHaveValue('2024-01-31')
  })

  test('should apply custom date range', async ({ page }) => {
    const customButton = page.getByRole('button', { name: /custom/i })
    await customButton.click()

    const dateInputs = page.locator('input[type="date"]')
    await dateInputs.first().fill('2024-01-01')
    await dateInputs.nth(1).fill('2024-01-31')

    const applyButton = page.getByRole('button', { name: /apply/i })
    await applyButton.click()

    // Should still show the dashboard (data refreshed)
    await expect(page.getByText(/analytics dashboard/i)).toBeVisible()
  })
})

test.describe('Analytics Dashboard - Session Persistence', () => {
  test('should persist login across page refresh', async ({ page }) => {
    await setupApiMocks(page)
    await page.goto('/en/analytics')
    await login(page)

    // Wait for dashboard to load
    await expect(page.getByText(/analytics dashboard/i)).toBeVisible({ timeout: 10000 })

    // Refresh the page
    await page.reload()

    // Should still be logged in (dashboard visible, not login form)
    await expect(page.getByText(/analytics dashboard/i)).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Analytics Dashboard - Translations', () => {
  test('should display in Spanish when visiting /es/analytics', async ({ page }) => {
    await setupApiMocks(page)
    await page.goto('/es/analytics')
    await page.waitForSelector('form')

    // Should show Spanish login text (analytics_login: "Inicio de Sesión")
    await expect(page.getByText(/Inicio de Sesión/i)).toBeVisible()
    await expect(page.getByText(/Usuario/i)).toBeVisible()
    await expect(page.getByText(/Contraseña/i)).toBeVisible()
  })

  test('should display in French when visiting /fr/analytics', async ({ page }) => {
    await setupApiMocks(page)
    await page.goto('/fr/analytics')
    await page.waitForSelector('form')

    // Should show French login text (analytics_login: "Connexion Analytique")
    await expect(page.getByText(/Connexion Analytique/i)).toBeVisible()
    await expect(page.getByText(/Nom d'utilisateur/i)).toBeVisible()
    await expect(page.getByText(/Mot de passe/i)).toBeVisible()
  })

  test('should display in German when visiting /de/analytics', async ({ page }) => {
    await setupApiMocks(page)
    await page.goto('/de/analytics')
    await page.waitForSelector('form')

    // Should show German login text (analytics_login: "Analyse-Anmeldung")
    await expect(page.getByText(/Analyse-Anmeldung/i)).toBeVisible()
    await expect(page.getByText(/Benutzername/i)).toBeVisible()
    await expect(page.getByText(/Passwort/i)).toBeVisible()
  })
})

test.describe('Analytics Dashboard - Error Handling', () => {
  test('should show error when API returns 500', async ({ page }) => {
    // First login check succeeds, subsequent calls fail
    let loginCheckDone = false

    await page.route('**/api/analytics/stats*', async (route) => {
      const authHeader = route.request().headers()['authorization']
      if (authHeader === 'Basic YWRtaW46cGFzc3dvcmQ=') {
        if (!loginCheckDone) {
          // First call during login - succeed
          loginCheckDone = true
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockStats),
          })
        } else {
          // Subsequent calls - fail
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Server error' }),
          })
        }
      } else {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Unauthorized' }),
        })
      }
    })

    await page.route('**/api/analytics/views*', async (route) => {
      const authHeader = route.request().headers()['authorization']
      if (authHeader === 'Basic YWRtaW46cGFzc3dvcmQ=') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' }),
        })
      } else {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Unauthorized' }),
        })
      }
    })

    await page.goto('/en/analytics')
    await login(page)

    // Should show error message (from views API failing)
    await expect(page.getByText(/failed to fetch/i)).toBeVisible({ timeout: 10000 })
  })

  test('should show no data message when stats are empty', async ({ page }) => {
    await page.route('**/api/analytics/stats*', async (route) => {
      const authHeader = route.request().headers()['authorization']
      if (authHeader === 'Basic YWRtaW46cGFzc3dvcmQ=') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            totalViews: 0,
            uniqueSessions: 0,
            todayViews: 0,
            weekViews: 0,
            topPages: [],
            topReferrers: [],
            browsers: [],
            userAgents: [],
          }),
        })
      } else {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Unauthorized' }),
        })
      }
    })

    await page.route('**/api/analytics/views*', async (route) => {
      const authHeader = route.request().headers()['authorization']
      if (authHeader === 'Basic YWRtaW46cGFzc3dvcmQ=') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [] }),
        })
      } else {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Unauthorized' }),
        })
      }
    })

    await page.goto('/en/analytics')
    await login(page)

    // Wait for dashboard
    await expect(page.getByText(/analytics dashboard/i)).toBeVisible({ timeout: 10000 })

    // Should show "No data" in multiple sections
    const noDataTexts = page.getByText(/no data yet/i)
    await expect(noDataTexts.first()).toBeVisible()
  })
})
