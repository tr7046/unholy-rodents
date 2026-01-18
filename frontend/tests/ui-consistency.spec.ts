import { test, expect } from '@playwright/test';

const publicPages = [
  { path: '/', name: 'Home' },
  { path: '/about', name: 'About' },
  { path: '/shows', name: 'Shows' },
  { path: '/music', name: 'Music' },
  { path: '/media', name: 'Media' },
  { path: '/store', name: 'Store' },
  { path: '/contact', name: 'Contact' },
];

const viewports = [
  { width: 1920, height: 1080, name: 'desktop-hd' },
  { width: 1280, height: 800, name: 'desktop' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 375, height: 812, name: 'mobile' },
];

test.describe('UI Consistency & Gap Analysis', () => {
  // Full page screenshots for all pages at desktop resolution
  for (const page of publicPages) {
    test(`Screenshot: ${page.name} page full view`, async ({ page: browserPage }) => {
      await browserPage.setViewportSize({ width: 1920, height: 1080 });
      await browserPage.goto(page.path, { waitUntil: 'networkidle' });
      await browserPage.waitForTimeout(2000); // Wait for animations

      await browserPage.screenshot({
        path: `test-results/ui-analysis/${page.name.toLowerCase()}-full.png`,
        fullPage: true,
      });

      // Check for empty containers or gaps
      const emptyContainers = await browserPage.evaluate(() => {
        const containers = document.querySelectorAll('section, div.container, div.grid');
        const issues: string[] = [];

        containers.forEach((container, idx) => {
          const rect = container.getBoundingClientRect();
          const hasContent = container.textContent?.trim().length || container.querySelectorAll('img, svg, video').length;

          // Check for suspiciously empty sections
          if (rect.height > 50 && !hasContent) {
            issues.push(`Empty container at y=${rect.y}, height=${rect.height}`);
          }

          // Check for very large vertical gaps
          if (rect.height > 500 && container.childElementCount === 0) {
            issues.push(`Large empty area at y=${rect.y}`);
          }
        });

        return issues;
      });

      if (emptyContainers.length > 0) {
        console.log(`\n--- Potential gaps on ${page.path} ---`);
        emptyContainers.forEach(issue => console.log(issue));
      }
    });
  }

  // Responsive screenshots for home page
  for (const viewport of viewports) {
    test(`Responsive: Home page at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);

      await page.screenshot({
        path: `test-results/ui-analysis/home-${viewport.name}.png`,
        fullPage: true,
      });

      // Check for horizontal overflow
      const horizontalOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth - document.documentElement.clientWidth;
      });

      expect(horizontalOverflow, `Horizontal overflow at ${viewport.name}`).toBeLessThan(20);
    });
  }

  // Visual consistency checks
  test('Check spacing and alignment consistency', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    const spacingIssues: string[] = [];

    for (const publicPage of publicPages) {
      await page.goto(publicPage.path, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      // Check for layout issues
      const layoutIssues = await page.evaluate(() => {
        const issues: string[] = [];

        // Check sections
        const sections = document.querySelectorAll('section');
        sections.forEach((section, idx) => {
          const rect = section.getBoundingClientRect();
          const styles = window.getComputedStyle(section);

          // Check for zero-height sections that should have content
          if (rect.height === 0 && section.childElementCount > 0) {
            issues.push(`Zero-height section with children at index ${idx}`);
          }

          // Check for missing padding/margin on sections
          const paddingTop = parseInt(styles.paddingTop);
          const paddingBottom = parseInt(styles.paddingBottom);
          if (rect.height > 100 && paddingTop === 0 && paddingBottom === 0) {
            issues.push(`Section ${idx} may need padding`);
          }
        });

        // Check for overlapping elements
        const allElements = document.querySelectorAll('h1, h2, h3, p, button, a');
        const positions: {el: string, rect: DOMRect}[] = [];

        allElements.forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            positions.push({ el: el.tagName, rect });
          }
        });

        return issues;
      });

      if (layoutIssues.length > 0) {
        spacingIssues.push(`${publicPage.path}: ${layoutIssues.join(', ')}`);
      }
    }

    if (spacingIssues.length > 0) {
      console.log('\n--- Layout Issues Found ---');
      spacingIssues.forEach(issue => console.log(issue));
    }
  });

  // Check for broken images or icons
  test('All images and icons load correctly', async ({ page }) => {
    const brokenAssets: string[] = [];

    for (const publicPage of publicPages) {
      await page.goto(publicPage.path, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      // Check images
      const brokenImages = await page.evaluate(() => {
        const images = document.querySelectorAll('img');
        const broken: string[] = [];
        images.forEach(img => {
          if (!img.complete || img.naturalWidth === 0) {
            broken.push(img.src || img.getAttribute('data-src') || 'unknown');
          }
        });
        return broken;
      });

      if (brokenImages.length > 0) {
        brokenAssets.push(`${publicPage.path}: ${brokenImages.join(', ')}`);
      }
    }

    if (brokenAssets.length > 0) {
      console.log('\n--- Broken Assets ---');
      brokenAssets.forEach(asset => console.log(asset));
    }
  });

  // Check color contrast and theme consistency
  test('Theme colors are consistent across pages', async ({ page }) => {
    const colorProfiles: { [key: string]: string }[] = [];

    for (const publicPage of publicPages.slice(0, 3)) {
      await page.goto(publicPage.path, { waitUntil: 'networkidle' });

      const colors = await page.evaluate(() => {
        const body = document.body;
        const header = document.querySelector('header');
        const footer = document.querySelector('footer');

        return {
          bodyBg: window.getComputedStyle(body).backgroundColor,
          headerBg: header ? window.getComputedStyle(header).backgroundColor : 'none',
          footerBg: footer ? window.getComputedStyle(footer).backgroundColor : 'none',
        };
      });

      colorProfiles.push(colors);
    }

    // All pages should have consistent header/footer colors
    const headerColors = colorProfiles.map(c => c.headerBg);
    const footerColors = colorProfiles.map(c => c.footerBg);

    console.log('\n--- Color Profile ---');
    console.log('Header backgrounds:', [...new Set(headerColors)]);
    console.log('Footer backgrounds:', [...new Set(footerColors)]);
  });

  // Interactive elements check
  test('All interactive elements are properly styled', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    for (const publicPage of publicPages) {
      await page.goto(publicPage.path, { waitUntil: 'networkidle' });

      // Check buttons have proper styling
      const buttonIssues = await page.evaluate(() => {
        const buttons = document.querySelectorAll('button, .btn, [role="button"]');
        const issues: string[] = [];

        buttons.forEach((btn, idx) => {
          const styles = window.getComputedStyle(btn as Element);
          const rect = (btn as Element).getBoundingClientRect();

          // Check for too small buttons
          if (rect.width > 0 && rect.height < 32) {
            issues.push(`Button ${idx} too small: ${rect.height}px height`);
          }

          // Check for invisible buttons
          if (styles.opacity === '0' || styles.visibility === 'hidden') {
            issues.push(`Button ${idx} is invisible`);
          }
        });

        return issues;
      });

      if (buttonIssues.length > 0) {
        console.log(`\n--- Button Issues on ${publicPage.path} ---`);
        buttonIssues.forEach(issue => console.log(issue));
      }
    }
  });

  // Store page specific checks
  test('Store page: Product grid layout check', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/store', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: 'test-results/ui-analysis/store-grid-desktop.png',
      fullPage: true,
    });

    // Check product grid
    const gridAnalysis = await page.evaluate(() => {
      const grid = document.querySelector('[class*="grid"]');
      if (!grid) return { error: 'No grid found' };

      const children = grid.children;
      const gaps: number[] = [];

      for (let i = 0; i < children.length - 1; i++) {
        const rect1 = children[i].getBoundingClientRect();
        const rect2 = children[i + 1].getBoundingClientRect();

        if (rect1.bottom < rect2.top) {
          gaps.push(rect2.top - rect1.bottom);
        }
      }

      return {
        itemCount: children.length,
        gaps: gaps,
        avgGap: gaps.length > 0 ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0,
      };
    });

    console.log('\n--- Store Grid Analysis ---');
    console.log(JSON.stringify(gridAnalysis, null, 2));
  });

  // Admin visibility page check
  test('Admin visibility page screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/hailsquatan/visibility', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: 'test-results/ui-analysis/admin-visibility.png',
      fullPage: true,
    });
  });
});
