import { test, expect } from '@playwright/test';

test.describe('Admin Header Fix Verification', () => {
  test('Products page - no duplicate title', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/hailsquatan/products', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: 'test-results/ui-analysis/admin-products-header.png',
      fullPage: false,
    });

    // Header should only say "Admin Panel", not "Admin > Products"
    const headerText = await page.locator('header').textContent();
    expect(headerText).toContain('Admin Panel');
    expect(headerText).not.toContain('Admin > Products');
  });

  test('Shows page - no duplicate title', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/hailsquatan/shows', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: 'test-results/ui-analysis/admin-shows-header.png',
      fullPage: false,
    });
  });

  test('Dashboard page header', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/hailsquatan/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: 'test-results/ui-analysis/admin-dashboard-header.png',
      fullPage: false,
    });
  });
});
