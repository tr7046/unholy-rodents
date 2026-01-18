import { test, expect } from '@playwright/test';

test.describe('Detailed Page Inspection', () => {
  test('Home page - all sections render correctly', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Check hero section
    const hero = page.locator('section').first();
    await expect(hero).toBeVisible();

    // Check for main heading
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();

    // Check navigation links
    const navLinks = page.locator('header a, nav a');
    const linkCount = await navLinks.count();
    console.log(`Navigation links found: ${linkCount}`);
    expect(linkCount).toBeGreaterThan(0);

    // Check for any broken images
    const images = await page.locator('img').all();
    for (const img of images) {
      const src = await img.getAttribute('src');
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      if (naturalWidth === 0 && src && !src.startsWith('data:')) {
        console.log(`Potentially broken image: ${src}`);
      }
    }
  });

  test('Store page - products render correctly', async ({ page }) => {
    await page.goto('/store', { waitUntil: 'networkidle' });

    // Check page title/heading
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();

    // Check for product cards or grid
    await page.waitForTimeout(2000); // Wait for any lazy loading

    // Look for product-related content
    const productContent = await page.locator('[class*="product"], [class*="card"], [class*="grid"]').count();
    console.log(`Product-related elements found: ${productContent}`);
  });

  test('About page - content sections load', async ({ page }) => {
    await page.goto('/about', { waitUntil: 'networkidle' });

    // Check for text content
    const textContent = await page.locator('p').count();
    console.log(`Paragraph elements found: ${textContent}`);
    expect(textContent).toBeGreaterThan(0);
  });

  test('Shows page - event content loads', async ({ page }) => {
    await page.goto('/shows', { waitUntil: 'networkidle' });

    // Check for show-related content
    const content = await page.textContent('body');
    console.log(`Page contains 'show' or 'event': ${content?.toLowerCase().includes('show') || content?.toLowerCase().includes('event')}`);
  });

  test('Music page - release content loads', async ({ page }) => {
    await page.goto('/music', { waitUntil: 'networkidle' });

    // Check for music-related content
    const content = await page.textContent('body');
    console.log(`Page contains 'album', 'release', or 'music': ${content?.toLowerCase().includes('album') || content?.toLowerCase().includes('release') || content?.toLowerCase().includes('music')}`);
  });

  test('Contact page - form elements present', async ({ page }) => {
    await page.goto('/contact', { waitUntil: 'networkidle' });

    // Check for form elements
    const inputs = await page.locator('input, textarea').count();
    console.log(`Form inputs found: ${inputs}`);

    // Check for submit button
    const submitBtn = await page.locator('button[type="submit"], input[type="submit"]').count();
    console.log(`Submit buttons found: ${submitBtn}`);
  });

  test('Check for CSS/styling issues', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Check for elements with no computed styles (potential CSS loading issues)
    const elementsWithNoStyle = await page.evaluate(() => {
      const issues: string[] = [];
      document.querySelectorAll('*').forEach((el) => {
        const style = window.getComputedStyle(el);
        // Check for common issues
        if (el.tagName === 'BUTTON' && style.cursor !== 'pointer') {
          issues.push(`Button without pointer cursor: ${el.className}`);
        }
      });
      return issues.slice(0, 10); // Limit to first 10
    });

    if (elementsWithNoStyle.length > 0) {
      console.log('Potential styling issues:', elementsWithNoStyle);
    }
  });

  test('Check z-index layering', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Scroll to trigger any fixed elements
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);

    // Check header stays on top
    const headerZIndex = await page.evaluate(() => {
      const header = document.querySelector('header');
      if (header) {
        return window.getComputedStyle(header).zIndex;
      }
      return 'no header';
    });
    console.log(`Header z-index: ${headerZIndex}`);
  });

  test('Check mobile menu functionality', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/', { waitUntil: 'networkidle' });

    // Look for hamburger menu
    const mobileMenuButton = page.locator('button[aria-label*="menu"], [class*="hamburger"], [class*="mobile-menu"]');
    const hasMobileMenu = await mobileMenuButton.count();

    console.log(`Mobile menu button found: ${hasMobileMenu > 0}`);

    if (hasMobileMenu > 0) {
      await mobileMenuButton.first().click();
      await page.waitForTimeout(500);

      // Check if menu opened
      const menuVisible = await page.locator('[class*="mobile-nav"], [role="menu"], nav').first().isVisible();
      console.log(`Menu visible after click: ${menuVisible}`);
    }
  });

  test('Check for console errors on all pages', async ({ page }) => {
    const pages = ['/', '/about', '/shows', '/music', '/media', '/store', '/contact'];
    const allErrors: { page: string; errors: string[] }[] = [];

    for (const pagePath of pages) {
      const errors: string[] = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.goto(pagePath, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);

      if (errors.length > 0) {
        allErrors.push({ page: pagePath, errors });
      }
    }

    if (allErrors.length > 0) {
      console.log('\n=== Console Errors Found ===');
      allErrors.forEach(({ page: p, errors }) => {
        console.log(`\n${p}:`);
        errors.forEach((e) => console.log(`  - ${e}`));
      });
    } else {
      console.log('No console errors found on any page!');
    }
  });

  test('Check font loading', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const fontsLoaded = await page.evaluate(async () => {
      await document.fonts.ready;
      const fonts: string[] = [];
      document.fonts.forEach((font) => {
        if (font.status === 'loaded') {
          fonts.push(`${font.family} ${font.weight}`);
        }
      });
      return fonts;
    });

    console.log('Loaded fonts:', fontsLoaded);
    expect(fontsLoaded.length).toBeGreaterThan(0);
  });

  test('Check animations work', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Check for animated elements
    const animatedElements = await page.evaluate(() => {
      const animated: string[] = [];
      document.querySelectorAll('*').forEach((el) => {
        const style = window.getComputedStyle(el);
        if (
          style.animation !== 'none' ||
          style.transition !== 'all 0s ease 0s'
        ) {
          const classes = el.className;
          if (typeof classes === 'string' && classes.length > 0) {
            animated.push(classes.split(' ')[0]);
          }
        }
      });
      return [...new Set(animated)].slice(0, 10);
    });

    console.log('Elements with animations/transitions:', animatedElements);
  });
});

test.describe('Accessibility Checks', () => {
  test('All images have alt text', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const imagesWithoutAlt = await page.evaluate(() => {
      const issues: string[] = [];
      document.querySelectorAll('img').forEach((img) => {
        if (!img.alt && !img.getAttribute('aria-hidden')) {
          issues.push(img.src || 'no-src');
        }
      });
      return issues;
    });

    if (imagesWithoutAlt.length > 0) {
      console.log('Images without alt text:', imagesWithoutAlt);
    }
  });

  test('Buttons have accessible names', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const buttonsWithoutName = await page.evaluate(() => {
      const issues: string[] = [];
      document.querySelectorAll('button').forEach((btn) => {
        const name =
          btn.textContent?.trim() ||
          btn.getAttribute('aria-label') ||
          btn.getAttribute('title');
        if (!name) {
          issues.push(btn.className || 'no-class');
        }
      });
      return issues;
    });

    if (buttonsWithoutName.length > 0) {
      console.log('Buttons without accessible names:', buttonsWithoutName);
    }
  });

  test('Links have discernible text', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const linksWithoutText = await page.evaluate(() => {
      const issues: string[] = [];
      document.querySelectorAll('a').forEach((link) => {
        const text =
          link.textContent?.trim() ||
          link.getAttribute('aria-label') ||
          link.querySelector('img')?.alt;
        if (!text) {
          issues.push(link.href || 'no-href');
        }
      });
      return issues;
    });

    if (linksWithoutText.length > 0) {
      console.log('Links without discernible text:', linksWithoutText);
    }
  });
});
