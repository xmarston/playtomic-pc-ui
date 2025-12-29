import { test, expect } from './fixtures'

test.describe('Middleware', () => {
  test.describe('static assets', () => {
    test('should serve images without redirect', async ({ page }) => {
      const response = await page.goto('/images/flags/en.svg')
      expect(response?.status()).toBe(200)
    })
  })

  test.describe('language detection', () => {
    test('should redirect to a language when accessing root', async ({ page }) => {
      await page.goto('/')
      // Should redirect to some language (defaults to en based on fallback)
      await expect(page).toHaveURL(/\/[a-z]{2}/)
    })
  })

  test.describe('language path handling', () => {
    test('should not redirect when path already contains valid English', async ({ page }) => {
      await page.goto('/en')
      await expect(page).toHaveURL(/\/en/)
    })

    test('should not redirect when path already contains valid Spanish', async ({ page }) => {
      await page.goto('/es')
      await expect(page).toHaveURL(/\/es/)
    })

    test('should not redirect when path already contains valid French', async ({ page }) => {
      await page.goto('/fr')
      await expect(page).toHaveURL(/\/fr/)
    })

    test('should not redirect when path already contains valid German', async ({ page }) => {
      await page.goto('/de')
      await expect(page).toHaveURL(/\/de/)
    })

    test('should not redirect when path already contains valid Italian', async ({ page }) => {
      await page.goto('/it')
      await expect(page).toHaveURL(/\/it/)
    })

    test('should not redirect when path already contains valid Dutch', async ({ page }) => {
      await page.goto('/nl')
      await expect(page).toHaveURL(/\/nl/)
    })

    test('should not redirect when path already contains valid Portuguese', async ({ page }) => {
      await page.goto('/pt')
      await expect(page).toHaveURL(/\/pt/)
    })
  })
})
