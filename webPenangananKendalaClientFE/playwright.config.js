import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    baseURL: 'http://127.0.0.1:5174',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
  webServer: [
    {
      command: 'php artisan serve --host=127.0.0.1 --port=8000',
      cwd: '../webPenangananKendalaClientBE',
      url: 'http://127.0.0.1:8000/api/health',
      reuseExistingServer: true,
      timeout: 30000,
    },
    {
      command: 'npx vite --port 5174 --host 127.0.0.1',
      url: 'http://127.0.0.1:5174',
      reuseExistingServer: true,
      timeout: 30000,
    },
    {
      command: 'node src/server.js',
      cwd: '../csService',
      url: 'http://127.0.0.1:3001/api/health',
      reuseExistingServer: true,
      timeout: 30000,
    },
  ],
});
