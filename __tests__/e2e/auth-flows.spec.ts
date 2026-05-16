// __tests__/e2e/auth-flows.spec.ts
import { test, expect } from '@playwright/test'
import { loginUser } from './utils/auth'

test.describe('Authentication Flows', () => {
    
    test('Admin can login successfully', async ({ page }) => {
        await loginUser(page, 'admin@gmail.com', 'jipmer', '/PuduCan/admin')
        await expect(page).toHaveURL(/\/PuduCan\/admin/, { timeout: 15000 })
    })

    test('Doctor can login successfully', async ({ page }) => {
        await loginUser(page, 'doctor@gmail.com', 'jipmer', '/PuduCan/doctor')
        await expect(page).toHaveURL(/\/PuduCan\/doctor/, { timeout: 15000 })
    })

    test('User can logout successfully', async ({ page }) => {
        // First login as admin
        await loginUser(page, 'admin@gmail.com', 'jipmer', '/PuduCan/admin')
        
        // Trigger Logout from Navbar
        // SignOutButton has text "Sign Out"
        const logoutTrigger = page.getByRole('button', { name: /sign out/i })
        await logoutTrigger.click()
        
        // Confirm Logout in AlertDialog
        // We target the "Sign Out" button specifically within the alert dialog
        await page.getByRole('alertdialog').getByRole('button', { name: /sign out/i }).click()

        // Verify redirect back to login
        await expect(page).toHaveURL(/\/login/, { timeout: 15000 })
    })
})
