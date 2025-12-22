import { test, expect } from '@playwright/test'

test.describe('i18n translations', () => {
  test('should display content in English when visiting /en', async ({ page }) => {
    await page.goto('/en')
    await expect(page.getByText('Padel Match Odds')).toBeVisible()
    await expect(page.getByRole('button', { name: /calculate/i })).toBeVisible()
  })

  test('should display content in Spanish when visiting /es', async ({ page }) => {
    await page.goto('/es')
    await expect(page.getByText('Padel Match Odds')).toBeVisible()
    await expect(page.getByRole('button', { name: /calcular/i })).toBeVisible()
  })

  test('should display content in French when visiting /fr', async ({ page }) => {
    await page.goto('/fr')
    await expect(page.getByText('Padel Match Odds')).toBeVisible()
    await expect(page.getByRole('button', { name: /calculer/i })).toBeVisible()
  })

  test('should display content in German when visiting /de', async ({ page }) => {
    await page.goto('/de')
    await expect(page.getByText('Padel Match Odds')).toBeVisible()
    await expect(page.getByRole('button', { name: /berechnen/i })).toBeVisible()
  })

  test('should display content in Italian when visiting /it', async ({ page }) => {
    await page.goto('/it')
    await expect(page.getByText('Padel Match Odds')).toBeVisible()
    await expect(page.getByRole('button', { name: /calcolare/i })).toBeVisible()
  })

  test('should display content in Dutch when visiting /nl', async ({ page }) => {
    await page.goto('/nl')
    await expect(page.getByText('Padel Match Odds')).toBeVisible()
    await expect(page.getByRole('button', { name: /bereken/i })).toBeVisible()
  })

  test('should display content in Portuguese when visiting /pt', async ({ page }) => {
    await page.goto('/pt')
    await expect(page.getByText('Padel Match Odds')).toBeVisible()
    await expect(page.getByRole('button', { name: /calcular/i })).toBeVisible()
  })

  test('should switch language when selecting from language selector', async ({ page }) => {
    await page.goto('/en')
    await expect(page.getByText('Padel Match Odds')).toBeVisible()

    // Open language selector
    const languageButton = page.getByRole('button', { name: /select language/i })
    await languageButton.click()

    // Select Spanish
    await page.getByRole('button', { name: 'Español' }).click()

    // Verify Spanish content
    await expect(page).toHaveURL(/\/es/)
    await expect(page.getByText('Padel Match Odds')).toBeVisible()
  })
})
