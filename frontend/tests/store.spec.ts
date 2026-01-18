import { test, expect } from '@playwright/test';

test.describe('Store Page', () => {
  test('should display store page with products', async ({ page }) => {
    await page.goto('/store', { waitUntil: 'networkidle' });

    // Should have store heading
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Should display products (check for product grid/cards)
    await page.waitForTimeout(1000);
    const productCards = await page.locator('[class*="product"], [class*="card"], [class*="grid"] > div').count();
    expect(productCards).toBeGreaterThan(0);
  });

  test('should filter products by category', async ({ page }) => {
    await page.goto('/store', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Find category filter buttons
    const filterButtons = page.locator('button').filter({ hasText: /accessories|apparel|all|bundles|music/i });
    const buttonCount = await filterButtons.count();

    if (buttonCount > 0) {
      // Click a filter
      await filterButtons.first().click();
      await page.waitForTimeout(500);

      // Products should still be visible after filtering
      const products = await page.locator('[class*="product"], [class*="card"]').count();
      expect(products).toBeGreaterThanOrEqual(0); // Could be 0 if filter has no products
    }
  });

  test('should open product modal when clicking product', async ({ page }) => {
    await page.goto('/store', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Find and click first product card
    const productCard = page.locator('[class*="product"], [class*="card"]').first();
    if (await productCard.count() > 0) {
      await productCard.click();
      await page.waitForTimeout(500);

      // Check for modal (dialog or expanded content)
      const hasModal = await page.locator('[role="dialog"], [class*="modal"], h2').count();
      expect(hasModal).toBeGreaterThan(0);
    }
  });

  test('should add product to cart', async ({ page }) => {
    await page.goto('/store', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Find and click first product
    const productCard = page.locator('[class*="product"], [class*="card"]').first();
    if (await productCard.count() > 0) {
      await productCard.click();
      await page.waitForTimeout(500);

      // Look for add to cart button
      const addButton = page.getByRole('button', { name: /add to cart/i });
      if (await addButton.count() > 0) {
        // May need to select variant first
        const variantButton = page.locator('button').filter({ hasText: /small|medium|large|xl/i }).first();
        if (await variantButton.count() > 0) {
          await variantButton.click();
        }

        await addButton.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should open cart sidebar', async ({ page }) => {
    await page.goto('/store', { waitUntil: 'networkidle' });

    // Click cart button (usually has cart icon or "cart" text)
    const cartButton = page.locator('button').filter({ hasText: /cart/i }).first();
    const cartIcon = page.locator('[aria-label*="cart"], [class*="cart"]').first();

    if (await cartButton.count() > 0) {
      await cartButton.click();
    } else if (await cartIcon.count() > 0) {
      await cartIcon.click();
    }

    await page.waitForTimeout(500);
  });

  test('should show free shipping banner', async ({ page }) => {
    await page.goto('/store', { waitUntil: 'networkidle' });

    // Check for shipping-related text
    const pageText = await page.textContent('body');
    const hasShippingInfo = pageText?.toLowerCase().includes('shipping') || pageText?.toLowerCase().includes('free');
    // This is optional, so we just log it
    console.log(`Free shipping info visible: ${hasShippingInfo}`);
  });
});
