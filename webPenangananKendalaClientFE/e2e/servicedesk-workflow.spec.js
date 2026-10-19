import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth.helper.js';

test.describe('Service Desk End-to-End Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'servicedesk@example.com', 'password');
  });

  test('Service Desk accesses console overview', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Console Service Desk' })).toBeVisible();
    await expect(page.getByText('Total Backlog')).toBeVisible();
    await expect(page.getByText('Active Tasks')).toBeVisible();
    await expect(page.getByText('Resolved & Closed')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Tiket Walk-in' })).toBeVisible();
  });

  test('Service Desk creates a Walk-in Ticket successfully', async ({ page }) => {
    // Navigate to walk-in ticket page
    await page.goto('/tickets/walk-in');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Buat Tiket Walk-in' })).toBeVisible();

    const uniqueTitle = `Walk-in Issue - ${Date.now()}`;
    const reporter = 'Ahmad Tester';

    await page.locator('#input-reporter-name').fill(reporter);
    await page.locator('#input-reporter-contact').fill('081234567890');
    await page.locator('#contact-method-whatsapp').click();
    await page.locator('#select-category').selectOption('Jaringan');
    await page.locator('#input-ticket-title').fill(uniqueTitle);
    await page.locator('#textarea-description').fill('Koneksi router kantor cabang terputus, butuh teknisi.');

    // Submit form
    await page.locator('#btn-submit-walkin').click();

    // Verify success card
    await expect(page.getByText('Berhasil Dibuat')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(uniqueTitle)).toBeVisible();
    await expect(page.getByText(reporter)).toBeVisible();
  });

  test('Service Desk can browse all tickets list', async ({ page }) => {
    await page.goto('/tickets');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /Tiket|Daftar Tiket/i }).first()).toBeVisible();
    // Verify tickets table has rows
    const rows = page.locator('table tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 10000 });
  });
});
