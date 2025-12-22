import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en')
  })

  test('should render the title', async ({ page }) => {
    await expect(page.getByText('Padel Match Odds')).toBeVisible()
  })

  test('should display Couple 1 section with header', async ({ page }) => {
    const couple1Section = page.locator('.bg-blue-50')
    await expect(couple1Section).toBeVisible()
    await expect(couple1Section.getByText('Couple 1')).toBeVisible()
  })

  test('should display Couple 2 section with header', async ({ page }) => {
    const couple2Section = page.locator('.bg-orange-50')
    await expect(couple2Section).toBeVisible()
    await expect(couple2Section.getByText('Couple 2')).toBeVisible()
  })

  test('should display VS divider between couples', async ({ page }) => {
    await expect(page.getByText('VS')).toBeVisible()
  })

  test('should have Players 1-2 in Couple 1 section', async ({ page }) => {
    const couple1Section = page.locator('.bg-blue-50')
    await expect(couple1Section.getByLabel('Player 1 Level')).toBeVisible()
    await expect(couple1Section.getByLabel('Player 2 Level')).toBeVisible()
  })

  test('should have Players 3-4 in Couple 2 section', async ({ page }) => {
    const couple2Section = page.locator('.bg-orange-50')
    await expect(couple2Section.getByLabel('Player 3 Level')).toBeVisible()
    await expect(couple2Section.getByLabel('Player 4 Level')).toBeVisible()
  })

  test('should render 4 player level inputs', async ({ page }) => {
    await expect(page.getByLabel('Player 1 Level')).toBeVisible()
    await expect(page.getByLabel('Player 2 Level')).toBeVisible()
    await expect(page.getByLabel('Player 3 Level')).toBeVisible()
    await expect(page.getByLabel('Player 4 Level')).toBeVisible()
  })

  test('should render 4 player reliability inputs', async ({ page }) => {
    await expect(page.getByText('Player 1 Reliability')).toBeVisible()
    await expect(page.getByText('Player 2 Reliability')).toBeVisible()
    await expect(page.getByText('Player 3 Reliability')).toBeVisible()
    await expect(page.getByText('Player 4 Reliability')).toBeVisible()
  })

  test('should render calculate button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /calculate/i })).toBeVisible()
  })

  test('should update player level on input change', async ({ page }) => {
    const input = page.getByLabel('Player 1 Level')
    await input.click()
    await input.selectText()
    await input.pressSequentially('5.5')
    await expect(input).toHaveValue('5.5')
  })

  test('should cap level at 7', async ({ page }) => {
    const input = page.getByLabel('Player 1 Level')
    await input.click()
    await input.selectText()
    await input.pressSequentially('8')
    await expect(input).toHaveValue('7')
  })

  test('should cap reliability at 100', async ({ page }) => {
    // Get the first player's reliability input (2nd input in the first row)
    const firstRow = page.locator('.flex.w-full').first()
    const reliabilityInput = firstRow.locator('input').nth(1)
    await reliabilityInput.click()
    await reliabilityInput.selectText()
    await reliabilityInput.pressSequentially('150')
    await expect(reliabilityInput).toHaveValue('100')
  })

  test('should only accept numeric values', async ({ page }) => {
    const input = page.getByLabel('Player 1 Level')
    await input.click()
    await input.selectText()
    await input.pressSequentially('abc')
    // Non-numeric values are rejected, value stays at 0
    await expect(input).toHaveValue('0')
  })

  test('should show validation errors when submitting with empty values', async ({ page }) => {
    const button = page.getByRole('button', { name: /calculate/i })
    await expect(button).toBeVisible()
    await button.click()

    // Wait for first error message to appear
    const levelErrors = page.getByText("Level can't be zero or string.")
    await levelErrors.first().waitFor({ state: 'visible' })

    const reliabilityErrors = page.getByText("Reliability  can't be zero or string.")

    await expect(levelErrors).toHaveCount(4)
    await expect(reliabilityErrors).toHaveCount(4)
  })

  test('should submit form with valid data and show results', async ({ page }) => {
    // Mock the API response
    await page.route('**/get-probability', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          probability_couple_1: 0.6,
          probability_couple_2: 0.4,
        }),
      })
    })

    // Fill in all 4 players using sequential typing
    const rows = page.locator('.flex.w-full')

    // Player 1
    const p1Level = rows.nth(0).locator('input').nth(0)
    const p1Reliability = rows.nth(0).locator('input').nth(1)
    await p1Level.click()
    await p1Level.selectText()
    await p1Level.pressSequentially('5')
    await p1Reliability.click()
    await p1Reliability.selectText()
    await p1Reliability.pressSequentially('80')

    // Player 2
    const p2Level = rows.nth(1).locator('input').nth(0)
    const p2Reliability = rows.nth(1).locator('input').nth(1)
    await p2Level.click()
    await p2Level.selectText()
    await p2Level.pressSequentially('4')
    await p2Reliability.click()
    await p2Reliability.selectText()
    await p2Reliability.pressSequentially('90')

    // Player 3
    const p3Level = rows.nth(2).locator('input').nth(0)
    const p3Reliability = rows.nth(2).locator('input').nth(1)
    await p3Level.click()
    await p3Level.selectText()
    await p3Level.pressSequentially('6')
    await p3Reliability.click()
    await p3Reliability.selectText()
    await p3Reliability.pressSequentially('75')

    // Player 4
    const p4Level = rows.nth(3).locator('input').nth(0)
    const p4Reliability = rows.nth(3).locator('input').nth(1)
    await p4Level.click()
    await p4Level.selectText()
    await p4Level.pressSequentially('3')
    await p4Reliability.click()
    await p4Reliability.selectText()
    await p4Reliability.pressSequentially('85')

    const button = page.getByRole('button', { name: /calculate/i })
    await button.click()

    // The actual text uses "Couple Probability" from translations
    await expect(page.getByText(/Couple Probability 1: 60.00%/)).toBeVisible()
    await expect(page.getByText(/Couple Probability 2: 40.00%/)).toBeVisible()
  })
})
