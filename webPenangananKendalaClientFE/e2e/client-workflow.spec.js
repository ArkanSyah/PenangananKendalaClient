import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth.helper.js';

test.describe('Client Ticketing End-to-End Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'client@example.com', 'password');
  });

  test('Client sees their dashboard overview and metrics', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Pusat Bantuan Klien' })).toBeVisible();
    await expect(page.getByText('Total Tiket')).toBeVisible();
    await expect(page.getByText('Masalah Aktif')).toBeVisible();
    await expect(page.getByText('Tiket Selesai')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Buat Tiket Baru' }).first()).toBeVisible();
  });

  test('Client can create a new ticket and view its details', async ({ page }) => {
    // Navigate to create ticket page
    await page.getByRole('link', { name: 'Buat Tiket Baru' }).first().click();
    await page.waitForURL('**/client/create');

    await expect(page.getByRole('heading', { name: 'Buat Tiket Baru' })).toBeVisible();

    // Fill form
    const uniqueTitle = `E2E Issue - ${Date.now()}`;
    const description = 'Laporan kendala integrasi client otomatis via Playwright E2E test';

    await page.locator('input[placeholder*="Contoh: Tidak dapat masuk"]').fill(uniqueTitle);
    await page.locator('textarea[placeholder*="Jelaskan kendala"]').fill(description);

    // Submit
    await page.locator('button[type="submit"]:has-text("Kirim Tiket")').click();

    // Verify success feedback
    await expect(page.getByText('Tiket bantuan berhasil dikirim!')).toBeVisible({ timeout: 10000 });

    // Should auto-redirect to ticket detail page
    await page.waitForURL(/\/client\/tickets\/TCK-/, { timeout: 10000 });

    // Verify ticket details on detail page
    await expect(page.getByText(uniqueTitle)).toBeVisible();
    await expect(page.getByText(description)).toBeVisible();
    await expect(page.getByText('Menunggu Konfirmasi', { exact: true })).toBeVisible();
    await expect(page.getByText('Riwayat Perkembangan Bantuan')).toBeVisible();
  });

  test('Client RBAC prevents access to admin or board views', async ({ page }) => {
    // Attempt navigating directly to /admin
    await page.goto('/admin');
    await page.waitForURL((url) => !url.pathname.includes('/admin'));
    expect(page.url()).not.toContain('/admin');

    // Attempt navigating directly to /board
    await page.goto('/board');
    await page.waitForURL((url) => !url.pathname.includes('/board'));
    expect(page.url()).not.toContain('/board');

    // Attempt navigating to /archive
    await page.goto('/archive');
    await page.waitForURL((url) => !url.pathname.includes('/archive'));
    expect(page.url()).not.toContain('/archive');
  });
});
