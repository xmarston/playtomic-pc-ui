import { test, expect } from './fixtures'

test.describe('Language Selector', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en')
  })

  test('should render the language selector button', async ({ page }) => {
    const button = page.getByRole('button', { name: /select language/i })
    await expect(button).toBeVisible()
  })

  test('should show current language flag', async ({ page }) => {
    const flag = page.getByRole('button', { name: /select language/i }).getByRole('img')
    await expect(flag).toBeVisible()
    await expect(flag).toHaveAttribute('src', '/images/flags/en.svg')
  })

  test('should not show language menu by default', async ({ page }) => {
    // Menu should not be visible initially
    const menu = page.getByTestId('language-menu')
    await expect(menu).not.toBeVisible()
  })

  test('should open language menu when button is clicked', async ({ page }) => {
    const button = page.getByRole('button', { name: /select language/i })
    await expect(button).toBeVisible()
    await button.click()

    // Wait for menu to appear
    const menu = page.getByTestId('language-menu')
    await menu.waitFor({ state: 'visible' })

    // Check all languages are listed
    await expect(menu.getByText('English')).toBeVisible()
    await expect(menu.getByText('Español')).toBeVisible()
    await expect(menu.getByText('Français')).toBeVisible()
    await expect(menu.getByText('Deutsch')).toBeVisible()
    await expect(menu.getByText('Italiano')).toBeVisible()
    await expect(menu.getByText('Nederlands')).toBeVisible()
    await expect(menu.getByText('Português')).toBeVisible()
  })

  test('should show all 7 language options in the menu', async ({ page }) => {
    const button = page.getByRole('button', { name: /select language/i })
    await expect(button).toBeVisible()
    await button.click()

    // Check that all language options are visible in the menu
    const menu = page.getByTestId('language-menu')
    await menu.waitFor({ state: 'visible' })
    const menuButtons = menu.locator('button')
    await expect(menuButtons).toHaveCount(7)
  })

  test('should navigate to selected language when clicked', async ({ page }) => {
    const button = page.getByRole('button', { name: /select language/i })
    await expect(button).toBeVisible()
    await button.click()

    const menu = page.getByTestId('language-menu')
    await menu.waitFor({ state: 'visible' })

    await menu.getByText('Español').click()

    await expect(page).toHaveURL(/\/es/)
  })

  test('should close menu after selecting a language', async ({ page }) => {
    const button = page.getByRole('button', { name: /select language/i })
    await button.click()

    const menu = page.getByTestId('language-menu')
    await expect(menu).toBeVisible()

    await menu.getByText('Français').click()

    // After navigation, we're on a new page
    await expect(page).toHaveURL(/\/fr/)
    // Menu should be closed on the new page
    await expect(page.getByTestId('language-menu')).not.toBeVisible()
  })

  test('should toggle menu open and closed', async ({ page }) => {
    const button = page.getByRole('button', { name: /select language/i })
    await expect(button).toBeVisible()
    const menu = page.getByTestId('language-menu')

    // Open menu
    await button.click()
    await menu.waitFor({ state: 'visible' })

    // Close menu
    await button.click()
    await menu.waitFor({ state: 'hidden' })
  })

  test('should highlight current language in menu', async ({ page }) => {
    const button = page.getByRole('button', { name: /select language/i })
    await expect(button).toBeVisible()
    await button.click()

    const menu = page.getByTestId('language-menu')
    await menu.waitFor({ state: 'visible' })

    // Find the English button within the menu
    const englishButton = menu.locator('button').filter({ hasText: 'English' })
    // The component uses bg-blue-50 class for highlighting
    await expect(englishButton).toHaveClass(/bg-blue-50/)
  })

  test('should navigate to different languages correctly', async ({ page }) => {
    const button = page.getByRole('button', { name: /select language/i })
    await expect(button).toBeVisible()
    await button.click()

    const menu = page.getByTestId('language-menu')
    await menu.waitFor({ state: 'visible' })

    await menu.getByText('Deutsch').click()

    await expect(page).toHaveURL(/\/de/)
  })
})
