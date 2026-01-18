import { test, expect } from '@playwright/test';

test.describe('Store Page', () => {
  test('should display store page with products', async ({ page }) => {
    await page.goto('/store');

    await expect(page.getByRole('heading', { name: 'STORE' })).toBeVisible();
    await expect(page.getByText('Gear up. Rep the horde.')).toBeVisible();

    // Should display products
    await expect(page.getByText('Unholy Rodents Classic Hoodie')).toBeVisible();
    await expect(page.getByText('Squirrelcore Logo Tee')).toBeVisible();
  });

  test('should filter products by category', async ({ page }) => {
    await page.goto('/store');

    // Click accessories filter
    await page.getByRole('button', { name: 'accessories' }).click();

    // Should only show accessories
    await expect(page.getByText('Sticker Pack')).toBeVisible();
    await expect(page.getByText('Unholy Rodents Classic Hoodie')).not.toBeVisible();

    // Click apparel filter
    await page.getByRole('button', { name: 'apparel' }).click();

    // Should only show apparel
    await expect(page.getByText('Unholy Rodents Classic Hoodie')).toBeVisible();
    await expect(page.getByText('Sticker Pack')).not.toBeVisible();

    // Click all filter
    await page.getByRole('button', { name: 'all' }).click();

    // Should show all products
    await expect(page.getByText('Unholy Rodents Classic Hoodie')).toBeVisible();
    await expect(page.getByText('Sticker Pack')).toBeVisible();
  });

  test('should open product modal when clicking product', async ({ page }) => {
    await page.goto('/store');

    // Click on a product
    await page.getByText('Unholy Rodents Classic Hoodie').click();

    // Modal should appear with product details
    await expect(page.getByRole('heading', { name: 'Unholy Rodents Classic Hoodie' })).toBeVisible();
    await expect(page.getByText('apparel')).toBeVisible();
  });

  test('should add product to cart', async ({ page }) => {
    await page.goto('/store');

    // Open product modal
    await page.getByText('Squirrelcore Logo Tee').click();

    // Select a size
    await page.getByRole('button', { name: 'Medium' }).click();

    // Add to cart
    await page.getByRole('button', { name: 'Add to Cart' }).click();

    // Cart button should show count
    await expect(page.getByText('1').first()).toBeVisible();
  });

  test('should open cart sidebar', async ({ page }) => {
    await page.goto('/store');

    // Click cart button
    await page.getByRole('button', { name: /cart/i }).click();

    // Cart sidebar should appear
    await expect(page.getByRole('heading', { name: 'YOUR CART' })).toBeVisible();
    await expect(page.getByText('Your cart is empty')).toBeVisible();
  });

  test('should show free shipping banner', async ({ page }) => {
    await page.goto('/store');

    await expect(page.getByText(/free shipping on orders over/i)).toBeVisible();
  });
});
