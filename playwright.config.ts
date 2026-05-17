import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
    testDir: './__tests__/e2e',
    reporter: 'html',

    expect: {
        timeout: 15000,
    },
    timeout: 60000,
    workers: 1,

    use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
        actionTimeout: 10000,
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],

    webServer: {
        command: 'pnpm dev',
        url: 'http://localhost:3000',
        reuseExistingServer: true,
        timeout: 120_000,
    },
})
