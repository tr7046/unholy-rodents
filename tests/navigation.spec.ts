import { test, expect } from '@playwright/test';

test.describe('Site Navigation', () => {
  test('should navigate to all main pages', async ({ page }) => {
    await page.goto('/');

    // Home page
    await expect(page.getByText('UNHOLY RODENTS')).toBeVisible();

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
    await page.goto('/');

    // Header should be visible
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();

    // Logo should link to home
    await expect(page.getByRole('link', { name: 'Unholy Rodents - Home' })).toBeVisible();
  });

  test('should have working footer navigation', async ({ page }) => {
    await page.goto('/');

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Footer should have navigation links
    await expect(page.getByRole('link', { name: 'Shows' }).last()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Music' }).last()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Store' }).last()).toBeVisible();
  });
});
