import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth.helper.js';

test.describe('Admin Console & Board Monitoring Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin@example.com', 'password');
  });

  test('Admin logs in and sees Admin Dashboard with metrics and activity logs', async ({ page }) => {
    await page.waitForURL('**/admin');
    await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();

    // Verify presence of Quota widget / stat widgets
    await expect(page.getByText('Total Pengguna', { exact: false })).toBeVisible({ timeout: 10000 });
  });

  test('Admin manages users and views user directory', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Manajemen Pengguna' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Buat Akun Baru' })).toBeVisible();

    // Verify key users appear in the table
    await expect(page.getByRole('cell', { name: 'System Administrator' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Service Desk Admin' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Project Manager Alpha' })).toBeVisible();

    // Verify search filter works
    const searchInput = page.getByPlaceholder('Cari nama atau email...');
    await searchInput.fill('Project Manager');
    await expect(page.getByRole('cell', { name: 'Project Manager Alpha' })).toBeVisible();
  });

  test('Admin navigates to Board Monitoring and views Kanban columns', async ({ page }) => {
    await page.goto('/board');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Board Monitoring' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Arsip' })).toBeVisible();

    // Check Kanban columns are rendered
    await expect(page.getByText('Pending Confirmation').first()).toBeVisible();
    await expect(page.getByText('Open', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('In Progress').first()).toBeVisible();
    await expect(page.getByText('Resolved', { exact: true }).first()).toBeVisible();
  });

  test('Admin can access and inspect the Archive Page', async ({ page }) => {
    await page.goto('/archive');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Arsip Tiket' })).toBeVisible();
    await expect(page.locator('input[placeholder*="Cari"]')).toBeVisible();
  });
});
