import { expect, test } from '@playwright/test'

test('shows the landing page for a visitor', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', { name: /kendali penuh/i }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: /masuk/i }).first()).toBeVisible()
})

test('shows the login page for an unauthenticated user on /login', async ({
  page,
}) => {
  await page.goto('/login')

  await expect(page.getByRole('heading', { name: /akses akun/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
})
