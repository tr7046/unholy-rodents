import { test, expect } from '@playwright/test';

test.describe('Site Navigation', () => {
  test('should navigate to all main pages', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Home page - check for band name in header or hero
    await expect(page.locator('header, [class*="hero"]').first()).toBeVisible();

    // Navigate to Shows
    await page.getByRole('link', { name: 'Shows' }).first().click();
    await expect(page).toHaveURL('/shows');

    // Navigate to Music
    await page.getByRole('link', { name: 'Music' }).first().click();
    await expect(page).toHaveURL('/music');

    // Navigate to Store
    await page.getByRole('link', { name: 'Store' }).first().click();
    await expect(page).toHaveURL('/store');

    // Navigate to About
    await page.getByRole('link', { name: 'About' }).first().click();
    await expect(page).toHaveURL('/about');

    // Navigate to Contact
    await page.getByRole('link', { name: 'Contact' }).first().click();
    await expect(page).toHaveURL('/contact');
  });

  test('should have working header navigation', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Header should be visible
    await expect(page.locator('header')).toBeVisible();

    // Navigation should exist
    const nav = page.locator('nav');
    await expect(nav.first()).toBeVisible();
  });

  test('should have working footer navigation', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Footer should exist
    await expect(page.locator('footer')).toBeVisible();
  });
});
