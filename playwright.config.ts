// playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
    testDir: './__tests__/e2e',
    use: {
        baseURL: 'http://localhost:3000',
        headless: true,
    },
    webServer: {
        command: 'pnpm dev',
        url: 'http://localhost:3000',
        reuseExistingServer: true,
    },
})
