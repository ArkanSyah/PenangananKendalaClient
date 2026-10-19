import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth.helper.js';

test.describe('Profile and Notification Settings E2E', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'client@example.com', 'password');
  });

  test('User views their profile and details', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Pengaturan Profil & Keamanan' })).toBeVisible();
    await expect(page.getByText('Informasi Profil & Email')).toBeVisible();
    await expect(page.getByText('Ubah Kata Sandi')).toBeVisible();

    // Check user info displayed
    await expect(page.locator('input[value="Corporate Client"], input[value*="Client"]')).toBeVisible();
    await expect(page.locator('input[value="client@example.com"]')).toBeVisible();
  });

  test('User configures notification preferences', async ({ page }) => {
    await page.goto('/settings/notifications');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Notifikasi', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Pengaturan', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Riwayat', exact: true })).toBeVisible();

    // Channel toggles & sections
    await expect(page.getByRole('heading', { name: 'Kontak' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Kanal Notifikasi' })).toBeVisible();

    // Navigate to history tab
    await page.getByRole('link', { name: 'Riwayat', exact: true }).click();
    await page.waitForURL('**/settings/notifications/history');
    await expect(page.getByRole('heading', { name: 'Riwayat Notifikasi' })).toBeVisible();
  });
});
