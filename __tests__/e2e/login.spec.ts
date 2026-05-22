// __tests__/e2e/login.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Login Page (E2E)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login')
    })

    test('renders login form', async ({ page }) => {
        await expect(page.getByPlaceholder('Email')).toBeVisible()
        await expect(page.getByPlaceholder('Password')).toBeVisible()
        await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
    })

    test('shows validation errors on empty submit', async ({ page }) => {
        await page.getByRole('button', { name: /sign in/i }).click()
        await expect(page.getByText(/email is required/i)).toBeVisible()
        await expect(page.getByText(/password is required/i)).toBeVisible()
    })

    test('shows error on short password', async ({ page }) => {
        await page.getByPlaceholder('Email').fill('test@test.com')
        await page.getByPlaceholder('Password').fill('123')
        await page.getByRole('button', { name: /sign in/i }).click()
        await expect(page.getByText(/at least 6 characters/i)).toBeVisible()
    })
})
