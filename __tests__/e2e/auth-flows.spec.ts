import { test, expect } from '@playwright/test'
import { loginUser } from './utils/auth'

const isForkPR = process.env.CI_FORK === 'true'

test.describe('Authentication Flows', () => {

    test('Admin can login successfully', async ({ page }) => {
        test.skip(isForkPR, 'Skipped on fork PRs — needs real Firebase')
        await loginUser(page, 'admin@gmail.com', 'jipmer', '/PuduCan/admin')
        await expect(page).toHaveURL(/\/PuduCan\/admin/, { timeout: 15000 })
    })

    test('Doctor can login successfully', async ({ page }) => {
        test.skip(isForkPR, 'Skipped on fork PRs — needs real Firebase')
        await loginUser(page, 'doctor@gmail.com', 'jipmer', '/PuduCan/doctor')
        await expect(page).toHaveURL(/\/PuduCan\/doctor/, { timeout: 15000 })
    })

    test('User can logout successfully', async ({ page }) => {
        test.skip(isForkPR, 'Skipped on fork PRs — needs real Firebase')
        await loginUser(page, 'admin@gmail.com', 'jipmer', '/PuduCan/admin')
        
        const logoutTrigger = page.getByRole('button', { name: /sign out/i })
        await logoutTrigger.click()
        
        await page.getByRole('alertdialog').getByRole('button', { name: /sign out/i }).click()
        await expect(page).toHaveURL(/\/login/, { timeout: 15000 })
    })
})
