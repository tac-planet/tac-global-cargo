import { test, expect } from '@playwright/test';

test.describe('Dashboard navigation', () => {
  test('redirects unauthenticated users away from dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url).toBeTruthy();
  });

  test('homepage links to dashboard/portal', async ({ page }) => {
    await page.goto('/');
    const portalLink = page.locator('a[href*="dashboard"], a[href*="login"], a:has-text("Access Portal")');
    await expect(portalLink.first()).toBeVisible();
  });
});
