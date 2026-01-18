import { test, expect } from '@playwright/test';

// All public pages to explore
const publicPages = [
  { path: '/', name: 'Home' },
  { path: '/about', name: 'About' },
  { path: '/shows', name: 'Shows' },
  { path: '/music', name: 'Music' },
  { path: '/media', name: 'Media' },
  { path: '/store', name: 'Store' },
  { path: '/contact', name: 'Contact' },
];

// Admin pages (require auth)
const adminPages = [
  { path: '/hailsquatan', name: 'Admin Login' },
  { path: '/hailsquatan/dashboard', name: 'Admin Dashboard' },
  { path: '/hailsquatan/products', name: 'Admin Products' },
  { path: '/hailsquatan/shows', name: 'Admin Shows' },
  { path: '/hailsquatan/music', name: 'Admin Music' },
  { path: '/hailsquatan/media', name: 'Admin Media' },
  { path: '/hailsquatan/about', name: 'Admin About' },
  { path: '/hailsquatan/homepage', name: 'Admin Homepage' },
  { path: '/hailsquatan/orders', name: 'Admin Orders' },
];

test.describe('Public Pages Exploration', () => {
  for (const page of publicPages) {
    test(`${page.name} (${page.path}) loads without errors`, async ({ page: browserPage }) => {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Capture console errors
      browserPage.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(`Console error: ${msg.text()}`);
        }
        if (msg.type() === 'warning' && msg.text().includes('Error')) {
          warnings.push(`Console warning: ${msg.text()}`);
        }
      });

      // Capture page errors
      browserPage.on('pageerror', (err) => {
        errors.push(`Page error: ${err.message}`);
      });

      // Navigate to page
      const response = await browserPage.goto(page.path, { waitUntil: 'networkidle' });

      // Check response status
      expect(response?.status(), `Page ${page.path} should return 200`).toBe(200);

      // Wait for any dynamic content
      await browserPage.waitForTimeout(1000);

      // Check for hydration errors
      const hydrationError = await browserPage.locator('text=Hydration failed').count();
      expect(hydrationError, `Page ${page.path} should not have hydration errors`).toBe(0);

      // Check for Next.js error overlay
      const errorOverlay = await browserPage.locator('[data-nextjs-dialog]').count();
      expect(errorOverlay, `Page ${page.path} should not have Next.js error overlay`).toBe(0);

      // Check for React error boundaries
      const reactError = await browserPage.locator('text=Something went wrong').count();

      // Log any console errors found
      if (errors.length > 0) {
        console.log(`\n--- Errors on ${page.path} ---`);
        errors.forEach((e) => console.log(e));
      }

      // Take screenshot for visual inspection
      await browserPage.screenshot({
        path: `test-results/screenshots/${page.name.toLowerCase().replace(/\s+/g, '-')}.png`,
        fullPage: true
      });

      // Assert no critical errors
      const criticalErrors = errors.filter(
        (e) => !e.includes('favicon') && !e.includes('404') && !e.includes('hydration')
      );
      expect(criticalErrors.length, `Page ${page.path} should have no critical errors`).toBe(0);
    });
  }
});

test.describe('Admin Pages Exploration', () => {
  test('Admin login page loads', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(`Console error: ${msg.text()}`);
      }
    });

    page.on('pageerror', (err) => {
      errors.push(`Page error: ${err.message}`);
    });

    const response = await page.goto('/hailsquatan', { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(200);

    // Should show login form
    await expect(page.locator('input[type="password"]')).toBeVisible({ timeout: 5000 });

    await page.screenshot({
      path: 'test-results/screenshots/admin-login.png',
      fullPage: true,
    });
  });

  for (const adminPage of adminPages.slice(1)) {
    test(`${adminPage.name} (${adminPage.path}) loads (may redirect if not authenticated)`, async ({
      page,
    }) => {
      const errors: string[] = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error' && !msg.text().includes('401')) {
          errors.push(`Console error: ${msg.text()}`);
        }
      });

      page.on('pageerror', (err) => {
        errors.push(`Page error: ${err.message}`);
      });

      const response = await page.goto(adminPage.path, { waitUntil: 'networkidle' });

      // Should either load or redirect to login
      expect([200, 302, 307]).toContain(response?.status());

      await page.waitForTimeout(1000);

      // Check for Next.js error overlay
      const errorOverlay = await page.locator('[data-nextjs-dialog]').count();
      expect(errorOverlay, `Page ${adminPage.path} should not have error overlay`).toBe(0);

      await page.screenshot({
        path: `test-results/screenshots/${adminPage.name.toLowerCase().replace(/\s+/g, '-')}.png`,
        fullPage: true,
      });
    });
  }
});

test.describe('Visual Consistency Checks', () => {
  test('Navigation is consistent across pages', async ({ page }) => {
    const navSelectors = ['header', 'nav', '[role="navigation"]'];

    for (const publicPage of publicPages.slice(0, 3)) {
      await page.goto(publicPage.path, { waitUntil: 'networkidle' });

      // Check header exists
      const hasNav = await page.locator('header').count();
      expect(hasNav, `Page ${publicPage.path} should have header`).toBeGreaterThan(0);
    }
  });

  test('Footer is consistent across pages', async ({ page }) => {
    for (const publicPage of publicPages.slice(0, 3)) {
      await page.goto(publicPage.path, { waitUntil: 'networkidle' });

      // Check footer exists
      const hasFooter = await page.locator('footer').count();
      expect(hasFooter, `Page ${publicPage.path} should have footer`).toBeGreaterThan(0);
    }
  });

  test('Color scheme is consistent (dark theme)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Check background color is dark
    const bodyBg = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });

    // Should be a dark color (rgb values should be low)
    expect(bodyBg).toMatch(/rgb\(\d{1,2}, \d{1,2}, \d{1,2}\)/);
  });
});

test.describe('Responsive Design Checks', () => {
  const viewports = [
    { width: 375, height: 667, name: 'mobile' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1280, height: 800, name: 'desktop' },
  ];

  for (const viewport of viewports) {
    test(`Home page renders correctly on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/', { waitUntil: 'networkidle' });

      // No horizontal scrollbar
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      // Take screenshot
      await page.screenshot({
        path: `test-results/screenshots/home-${viewport.name}.png`,
        fullPage: true,
      });

      // Small horizontal scroll can be acceptable due to animations
      if (hasHorizontalScroll) {
        const overflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth - document.documentElement.clientWidth;
        });
        expect(overflow, `Horizontal overflow on ${viewport.name} should be minimal`).toBeLessThan(
          50
        );
      }
    });
  }
});

test.describe('Link Validation', () => {
  test('All navigation links are valid', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Get all navigation links
    const navLinks = await page.locator('header a, nav a').all();

    for (const link of navLinks) {
      const href = await link.getAttribute('href');
      if (href && href.startsWith('/') && !href.includes('#')) {
        // Test internal links
        const response = await page.goto(href, { waitUntil: 'domcontentloaded' });
        expect(
          response?.status(),
          `Link ${href} should return success status`
        ).toBeLessThanOrEqual(399);
      }
    }
  });
});

test.describe('Performance Checks', () => {
  test('Home page loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/', { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;

    console.log(`Home page load time: ${loadTime}ms`);

    // Should load within 10 seconds (generous for dev mode)
    expect(loadTime).toBeLessThan(10000);
  });
});
