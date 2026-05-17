// __tests__/e2e/navigation.spec.ts
import { test, expect } from '@playwright/test'
import { loginUser } from './utils/auth'

test.describe('Admin Navigation Flows', () => {
    
    test('Login as admin and navigate to Stats page', async ({ page }) => {
        // 1. Login as admin
        await loginUser(page, 'admin@gmail.com', 'jipmer', '/PuduCan/admin')

        // 2. Navigate to Stats page using navbar
        const statsLink = page.getByRole('link', { name: /stats/i })
        await statsLink.click()

        // 3. Verify correct page and URL loaded
        await expect(page).toHaveURL(/\/PuduCan\/stats/, { timeout: 15000 })
        
        // Verify stats content is visible
        // We look for common text in stats sections
        await expect(page.getByText(/patients/i).first()).toBeVisible({ timeout: 15000 })
    })
})
