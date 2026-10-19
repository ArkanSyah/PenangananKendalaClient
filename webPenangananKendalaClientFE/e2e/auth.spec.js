import { test, expect } from '@playwright/test';
import { loginAs, quickLoginAs, logout } from './helpers/auth.helper.js';

test.describe('Authentication & Access Control', () => {
  test('Login screen renders properly with branding and quick login options', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/Process-Driven Ticket Handling System|Ticket/i);
    await expect(page.getByText('Ticketing System')).toBeVisible();
    await expect(page.getByText('Penanganan Kendala Client — RBAC Console')).toBeVisible();

    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Verify quick login buttons are available
    await expect(page.getByRole('button', { name: 'Service Desk' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Project Manager' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Programmer' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Owner' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Client' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Admin (RBAC)' })).toBeVisible();
  });

  test('Invalid credentials display error alert', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('wrong@example.com');
    await page.locator('input[type="password"]').fill('wrongpassword');
    await page.locator('button[type="submit"]').click();

    // Expect error message visible
    const errorBox = page.locator('.text-red-700, .bg-red-50');
    await expect(errorBox).toBeVisible({ timeout: 10000 });
  });

  test('Unauthenticated user accessing protected route is redirected to /login', async ({ page }) => {
    await page.goto('/tickets');
    await page.waitForURL('**/login', { timeout: 10000 });
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('Successful login via form authentication and logout flow', async ({ page }) => {
    await loginAs(page, 'servicedesk@example.com', 'password');

    // Should be redirected to dashboard
    expect(page.url()).not.toContain('/login');
    await expect(page.getByRole('heading', { name: 'Console Service Desk' })).toBeVisible();

    // Now test logout
    await logout(page);
    expect(page.url()).toContain('/login');
  });

  test('Quick login button authenticates successfully', async ({ page }) => {
    await quickLoginAs(page, 'Client');
    expect(page.url()).not.toContain('/login');
    await expect(page.getByText('Pusat Bantuan Klien')).toBeVisible();

    await logout(page);
    expect(page.url()).toContain('/login');
  });
});
