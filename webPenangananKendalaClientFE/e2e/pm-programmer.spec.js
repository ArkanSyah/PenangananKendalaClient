import { test, expect } from '@playwright/test';
import { loginAs, logout } from './helpers/auth.helper.js';

test.describe('PM and Programmer Workflow & RBAC Gating', () => {
  test('Project Manager accesses allocation and claim approval queues', async ({ page }) => {
    await loginAs(page, 'pm@example.com', 'password');

    // Allocation queue
    await page.goto('/tickets/assign');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Resource Allocation Queue (PM)' })).toBeVisible();

    // Claim approval queue
    await page.goto('/tickets/claim-approval');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Ticket Claim Approval' })).toBeVisible();

    await logout(page);
  });

  test('Programmer accesses tasks and available tickets queue', async ({ page }) => {
    await loginAs(page, 'programmer@example.com', 'password');

    // My tasks
    await page.goto('/tickets/tasks');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'My Backlog Tasks' })).toBeVisible();

    // Available tickets for claiming
    await page.goto('/tickets/available');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Available Tickets' })).toBeVisible();

    // Verify programmer cannot access PM routes
    await page.goto('/tickets/assign');
    await page.waitForURL((url) => !url.pathname.includes('/tickets/assign'));
    expect(page.url()).not.toContain('/tickets/assign');

    await logout(page);
  });
});
