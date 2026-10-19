/**
 * Auth helper for Playwright E2E tests.
 */
export async function loginAs(page, email, password = 'password') {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  // Fill credentials
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();

  // Wait for redirect away from /login
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
  await page.waitForLoadState('networkidle');
}

export async function quickLoginAs(page, roleButtonText) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  const roleButton = page.getByRole('button', { name: roleButtonText, exact: true });
  await roleButton.click();

  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
  await page.waitForLoadState('networkidle');
}

export async function logout(page) {
  // Find the logout button in header or sidebar
  const logoutButton = page.locator('button:has-text("Logout"), button[title="Sign out"], button:has(svg.lucide-log-out)').first();
  await logoutButton.click();
  await page.waitForURL('**/login', { timeout: 15000 });
}
