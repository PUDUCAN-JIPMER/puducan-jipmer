import { test, expect } from '@playwright/test'
import { injectAxe, checkA11y, getViolations } from 'axe-playwright'

test.describe('Login Page (Accessibility)', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/login')
        await injectAxe(page)
    })

    test('has no accessibility violations', async ({ page }) => {
        await checkA11y(page)
    })

    test('form inputs have accessible labels', async ({ page }) => {
        const violations = await getViolations(page)
        const labelViolations = violations.filter(v => v.id === 'label')
        expect(labelViolations).toHaveLength(0)
    })

    test('buttons have accessible names', async ({ page }) => {
        const violations = await getViolations(page)
        const buttonViolations = violations.filter(v => v.id === 'button-name')
        expect(buttonViolations).toHaveLength(0)
    })

    test('images have alt text', async ({ page }) => {
        const violations = await getViolations(page)
        const imageViolations = violations.filter(v => v.id === 'image-alt')
        expect(imageViolations).toHaveLength(0)
    })

    test('color contrast is sufficient', async ({ page }) => {
        const violations = await getViolations(page)
        const contrastViolations = violations.filter(v => v.id === 'color-contrast')
        expect(contrastViolations).toHaveLength(0)
    })
})
