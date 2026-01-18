import { test, expect } from '@playwright/test';

// This test requires ADMIN_USERNAME and ADMIN_PASSWORD environment variables to be set
// For local testing, you can set them in .env.local

test.describe('Admin Pages (Authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/hailsquatan');

    // Fill login form - use environment variables or test credentials
    await page.fill('input[id="username"]', process.env.ADMIN_USERNAME || 'admin');
    await page.fill('input[id="password"]', process.env.ADMIN_PASSWORD || 'test123');
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL(/\/hailsquatan\/dashboard/, { timeout: 10000 });
  });

  test('Dashboard - no duplicate title in header', async ({ page }) => {
    await page.goto('/hailsquatan/dashboard');
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: 'test-results/ui-analysis/admin-dashboard-auth.png',
      fullPage: true,
    });

    // Header should not contain page-specific title
    const headerText = await page.locator('header').textContent();
    expect(headerText).toContain('UNHOLY');
    expect(headerText).toContain('ADMIN');

    // Page content should have the title
    const pageTitle = await page.locator('h1').first().textContent();
    expect(pageTitle).toContain('Dashboard');
  });

  test('Visibility page - no hydration errors', async ({ page }) => {
    await page.goto('/hailsquatan/visibility');
    await page.waitForTimeout(2000);

    // Check for hydration errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('hydration')) {
        errors.push(msg.text());
      }
    });

    await page.screenshot({
      path: 'test-results/ui-analysis/admin-visibility-auth.png',
      fullPage: true,
    });

    // Should see visibility controls
    await expect(page.locator('text=VISIBILITY CONTROLS')).toBeVisible();

    // Header should only show "UNHOLY ADMIN", not "Visibility"
    const headerText = await page.locator('header').textContent();
    expect(headerText).not.toContain('Visibility');

    expect(errors.length).toBe(0);
  });

  test('Products page - no duplicate title', async ({ page }) => {
    await page.goto('/hailsquatan/products');
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: 'test-results/ui-analysis/admin-products-auth.png',
      fullPage: true,
    });

    // Header should not contain "Products"
    const headerText = await page.locator('header').textContent();
    expect(headerText).not.toContain('Products');
  });
});
