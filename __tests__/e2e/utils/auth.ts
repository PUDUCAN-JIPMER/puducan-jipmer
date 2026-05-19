// __tests__/e2e/utils/auth.ts
import { Page, expect } from '@playwright/test'

/**
 * Reusable login helper for PuduCan E2E tests.
 * @param page Playwright Page object
 * @param email User email
 * @param password User password
 * @param expectedPath The expected path to redirect to after successful login
 */
export async function loginUser(page: Page, email: string, password: string, expectedPath: string) {
    await page.goto('/login', { waitUntil: 'domcontentloaded' })

    // 1. Ensure the login form is ready
    const signInButton = page.getByRole('button', { name: /sign in/i })
    await expect(signInButton).toBeVisible({ timeout: 10000 })

    // 2. Fill credentials using label-based selectors for maximum stability
    await page.getByLabel('Email', { exact: true }).fill(email)
    await page.getByLabel('Password', { exact: true }).fill(password)

    // 3. Trigger login
    await signInButton.click()

    // 4. Verify redirect with high timeout for Firebase/Next.js
    await expect(page).toHaveURL(new RegExp(expectedPath), { timeout: 30000 })

    // 5. CRITICAL: Stabilize post-login UI. 
    // Wait for the "Sign Out" button in the Navbar. 
    // This confirms the AuthContext is updated and the Navbar is interactive.
    await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible({ timeout: 15000 })
}
