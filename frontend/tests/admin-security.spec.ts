import { test, expect } from '@playwright/test';

test.describe('Admin Security - Middleware Protection', () => {
  test('Unauthenticated user is redirected to login when accessing dashboard', async ({ page }) => {
    // Clear any existing cookies
    await page.context().clearCookies();

    // Try to access dashboard directly
    await page.goto('/hailsquatan/dashboard');

    // Should be redirected to login page
    await expect(page).toHaveURL(/\/hailsquatan\?redirect=/);

    // Should see login form
    await expect(page.locator('input[type="password"]')).toBeVisible();

    await page.screenshot({
      path: 'test-results/ui-analysis/security-redirect-to-login.png',
      fullPage: true,
    });
  });

  test('Unauthenticated user is redirected when accessing products page', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/hailsquatan/products');

    // Should be redirected to login
    await expect(page).toHaveURL(/\/hailsquatan\?redirect=/);
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('Unauthenticated user is redirected when accessing visibility page', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/hailsquatan/visibility');

    // Should be redirected to login
    await expect(page).toHaveURL(/\/hailsquatan\?redirect=/);
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('Login page is accessible without redirect loop', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/hailsquatan');

    // Should stay on login page
    await expect(page).toHaveURL('/hailsquatan');
    await expect(page.locator('input[type="password"]')).toBeVisible();

    await page.screenshot({
      path: 'test-results/ui-analysis/security-login-page.png',
      fullPage: true,
    });
  });

  test('No admin content is visible before login', async ({ page }) => {
    await page.context().clearCookies();

    // Try to access a protected page
    const response = await page.goto('/hailsquatan/dashboard');

    // Should get a redirect response
    expect(response?.status()).toBe(200); // Final page after redirect

    // Should NOT see any admin content
    const pageContent = await page.textContent('body');
    expect(pageContent).not.toContain('DASHBOARD');
    expect(pageContent).not.toContain('Products');
    expect(pageContent).not.toContain('Admin Tasks');

    // Should see login content
    expect(pageContent).toContain('HAIL SQUATAN');
  });
});
