import { test, expect } from '@playwright/test';

const TEST_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const TEST_PASSWORD = process.env.ADMIN_PASSWORD || 'testpass';

test.describe('Admin Panel (/hailsquatan)', () => {
  test('should show login page when not authenticated', async ({ page }) => {
    await page.goto('/hailsquatan');

    // Should see login form
    await expect(page.getByRole('heading', { name: 'HAIL SQUATAN' })).toBeVisible();
    await expect(page.getByLabel('Username')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /enter the squnderworld/i })).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/hailsquatan');

    await page.getByLabel('Username').fill('wrong');
    await page.getByLabel('Password').fill('wrong');
    await page.getByRole('button', { name: /enter the squnderworld/i }).click();

    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });

  test('should login with correct credentials', async ({ page }) => {
    await page.goto('/hailsquatan');

    await page.getByLabel('Username').fill(TEST_USERNAME);
    await page.getByLabel('Password').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /enter the squnderworld/i }).click();

    // Should redirect to products page
    await expect(page).toHaveURL('/hailsquatan/products');
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
  });

  test('should navigate between admin sections', async ({ page }) => {
    // Login first
    await page.goto('/hailsquatan');
    await page.getByLabel('Username').fill(TEST_USERNAME);
    await page.getByLabel('Password').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /enter the squnderworld/i }).click();
    await expect(page).toHaveURL('/hailsquatan/products');

    // Navigate to Shows
    await page.getByRole('link', { name: 'Shows' }).click();
    await expect(page).toHaveURL('/hailsquatan/shows');
    await expect(page.getByRole('heading', { name: 'Shows' })).toBeVisible();

    // Navigate to Music
    await page.getByRole('link', { name: 'Music' }).click();
    await expect(page).toHaveURL('/hailsquatan/music');
    await expect(page.getByRole('heading', { name: 'Music' })).toBeVisible();

    // Navigate to About
    await page.getByRole('link', { name: 'About' }).click();
    await expect(page).toHaveURL('/hailsquatan/about');
    await expect(page.getByRole('heading', { name: 'About' })).toBeVisible();

    // Navigate to Media
    await page.getByRole('link', { name: 'Media' }).click();
    await expect(page).toHaveURL('/hailsquatan/media');
    await expect(page.getByRole('heading', { name: 'Media' })).toBeVisible();

    // Navigate to Homepage
    await page.getByRole('link', { name: 'Homepage' }).click();
    await expect(page).toHaveURL('/hailsquatan/homepage');
    await expect(page.getByRole('heading', { name: 'Homepage' })).toBeVisible();

    // Navigate to Orders
    await page.getByRole('link', { name: 'Orders' }).click();
    await expect(page).toHaveURL('/hailsquatan/orders');
    await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible();
  });

  test('should display products from JSON data', async ({ page }) => {
    // Login first
    await page.goto('/hailsquatan');
    await page.getByLabel('Username').fill(TEST_USERNAME);
    await page.getByLabel('Password').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /enter the squnderworld/i }).click();

    // Should see products table
    await expect(page.getByText('Unholy Rodents Classic Hoodie')).toBeVisible();
    await expect(page.getByText('Squirrelcore Logo Tee')).toBeVisible();
    await expect(page.getByText('Sticker Pack')).toBeVisible();
    await expect(page.getByText('Starter Bundle')).toBeVisible();
  });

  test('should open product edit modal', async ({ page }) => {
    // Login first
    await page.goto('/hailsquatan');
    await page.getByLabel('Username').fill(TEST_USERNAME);
    await page.getByLabel('Password').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /enter the squnderworld/i }).click();

    // Click edit on first product
    await page.locator('button').filter({ has: page.locator('[data-testid="pencil-icon"]') }).first().click();

    // Modal should appear
    await expect(page.getByRole('heading', { name: 'Edit Product' })).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/hailsquatan');
    await page.getByLabel('Username').fill(TEST_USERNAME);
    await page.getByLabel('Password').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /enter the squnderworld/i }).click();
    await expect(page).toHaveURL('/hailsquatan/products');

    // Click logout
    await page.getByRole('button', { name: 'Logout' }).click();

    // Should redirect to login page
    await expect(page.getByRole('heading', { name: 'HAIL SQUATAN' })).toBeVisible();
  });
});
