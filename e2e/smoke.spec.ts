import { expect, test } from '@playwright/test'

test('shows the login page for a signed-out visitor', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', { name: /welcome back/i }),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
})
