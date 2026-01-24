import { test, expect } from '@playwright/test';

const BASE_URL = 'https://unholy-rodents.vercel.app';
const ADMIN_USERNAME = 'squatan';
const ADMIN_PASSWORD = '5ick@sbru';

test.describe('Admin Bio Save', () => {
  test('should save bio and persist after refresh', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/hailsquatan`);
    await page.fill('input[type="text"]', ADMIN_USERNAME);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('**/hailsquatan/dashboard', { timeout: 15000 });
    console.log('Logged in successfully');

    // Navigate to About page
    await page.goto(`${BASE_URL}/hailsquatan/about`);
    await page.waitForLoadState('networkidle');
    console.log('On about page');

    // Take screenshot to see what we have
    await page.screenshot({ path: 'test-results/about-page.png' });

    // Click on Bio tab (case insensitive)
    const bioTab = page.locator('button').filter({ hasText: /bio/i });
    await bioTab.click();
    await page.waitForTimeout(1000);
    console.log('Clicked bio tab');

    // Take screenshot after clicking bio
    await page.screenshot({ path: 'test-results/bio-tab.png' });

    // Check if there's a textarea or if we need to add a paragraph first
    const textareaCount = await page.locator('textarea').count();
    console.log('Textarea count:', textareaCount);

    if (textareaCount === 0) {
      // Maybe need to click "Add Paragraph" first
      const addBtn = page.locator('button').filter({ hasText: /add paragraph/i });
      if (await addBtn.count() > 0) {
        await addBtn.click();
        await page.waitForTimeout(500);
        console.log('Added paragraph');
      }
    }

    // Generate unique test content
    const testContent = `Test bio content ${Date.now()}`;

    // Find first textarea and fill it
    const textarea = page.locator('textarea').first();
    await textarea.waitFor({ timeout: 5000 });
    await textarea.fill(testContent);
    console.log('Filled textarea');

    // Click Save button
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(3000);
    console.log('Clicked save');

    // Take screenshot after save
    await page.screenshot({ path: 'test-results/after-save.png' });

    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');
    console.log('Reloaded page');

    // Click on Bio tab again
    await bioTab.click();
    await page.waitForTimeout(1000);

    // Take screenshot after reload
    await page.screenshot({ path: 'test-results/after-reload.png' });

    // Check if content persisted
    const savedContent = await page.locator('textarea').first().inputValue();

    console.log('Expected:', testContent);
    console.log('Actual:', savedContent);

    expect(savedContent).toBe(testContent);
  });
});
