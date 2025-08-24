const { test, expect } = require('@playwright/test');

test.describe('Media Manipulation Detection Frontend', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main page correctly', async ({ page }) => {
    await expect(page).toHaveTitle('Media Manipulation Detection');
    await expect(page.locator('h1')).toContainText('Media Manipulation Detection');
    await expect(page.locator('form#detectionForm')).toBeVisible();
    await expect(page.locator('input#originalUrl')).toBeVisible();
    await expect(page.locator('input#suspectUrl')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should validate form inputs', async ({ page }) => {
    const analyzeButton = page.locator('button[type="submit"]');
    
    // Try submitting empty form
    await analyzeButton.click();
    
    // Check HTML5 validation kicks in
    const originalInput = page.locator('input#originalUrl');
    const suspectInput = page.locator('input#suspectUrl');
    
    expect(await originalInput.evaluate(el => el.validity.valid)).toBe(false);
    expect(await suspectInput.evaluate(el => el.validity.valid)).toBe(false);
  });

  test('should show loading state when form is submitted', async ({ page }) => {
    // Fill form with URLs that will cause a slower response
    await page.fill('input#originalUrl', 'http://httpbin.org/delay/2');
    await page.fill('input#suspectUrl', 'http://httpbin.org/delay/2');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Check loading state appears (with longer timeout since backend may be slow)
    await expect(page.locator('#loading')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#loading')).toContainText('Analyzing images...');
  });

  test('should show image previews when URLs are entered', async ({ page }) => {
    // Use data URLs that will always work without network dependency
    const originalUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    const suspectUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    // Fill original URL and check preview
    await page.fill('input#originalUrl', originalUrl);
    await page.waitForTimeout(100); // Minimal wait for DOM update
    
    const originalPreview = page.locator('#originalPreview');
    await expect(originalPreview).toHaveAttribute('src', originalUrl);
    // Check if preview becomes visible or at least has the src set
    await expect(originalPreview).not.toHaveClass(/hidden/);
    
    // Fill suspect URL and check preview
    await page.fill('input#suspectUrl', suspectUrl);
    await page.waitForTimeout(100); // Minimal wait for DOM update
    
    const suspectPreview = page.locator('#suspectPreview');
    await expect(suspectPreview).toHaveAttribute('src', suspectUrl);
    await expect(suspectPreview).not.toHaveClass(/hidden/);
  });

  test('should handle invalid image URLs gracefully', async ({ page }) => {
    // Enter invalid URLs
    await page.fill('input#originalUrl', 'https://example.com/nonexistent.jpg');
    await page.fill('input#suspectUrl', 'https://example.com/nonexistent2.jpg');
    
    // Images should be hidden when they fail to load
    await page.waitForTimeout(2000);
    
    // The previews might not be visible due to onerror handling
    const originalPreview = page.locator('#originalPreview');
    const suspectPreview = page.locator('#suspectPreview');
    
    // These might be hidden due to onerror handlers
    const originalVisible = await originalPreview.isVisible();
    const suspectVisible = await suspectPreview.isVisible();
    
    // At least one should be hidden or both should be hidden
    expect(originalVisible || suspectVisible).toBe(false);
  });

  test('should hide all result sections initially', async ({ page }) => {
    await expect(page.locator('#loading')).toHaveClass(/hidden/);
    await expect(page.locator('#results')).toHaveClass(/hidden/);
    await expect(page.locator('#error')).toHaveClass(/hidden/);
  });

  test('should have proper form accessibility', async ({ page }) => {
    // Check labels are associated with inputs
    const originalLabel = page.locator('label[for="originalUrl"]');
    const suspectLabel = page.locator('label[for="suspectUrl"]');
    
    await expect(originalLabel).toBeVisible();
    await expect(suspectLabel).toBeVisible();
    await expect(originalLabel).toContainText('Original Image URL');
    await expect(suspectLabel).toContainText('Suspect Image URL');
    
    // Check inputs have proper attributes
    await expect(page.locator('input#originalUrl')).toHaveAttribute('type', 'url');
    await expect(page.locator('input#suspectUrl')).toHaveAttribute('type', 'url');
    await expect(page.locator('input#originalUrl')).toHaveAttribute('required');
    await expect(page.locator('input#suspectUrl')).toHaveAttribute('required');
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.container')).toBeVisible();
    await expect(page.locator('form#detectionForm')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.container')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('.container')).toBeVisible();
  });
});

test.describe('Form Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should clear results when new form is submitted', async ({ page }) => {
    // Fill form with test URLs
    await page.fill('input#originalUrl', 'https://via.placeholder.com/300x200.jpg');
    await page.fill('input#suspectUrl', 'https://via.placeholder.com/300x200.jpg');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for loading state
    await expect(page.locator('#loading')).toBeVisible();
    
    // The results and error sections should be hidden when loading starts
    await expect(page.locator('#results')).toHaveClass(/hidden/);
    await expect(page.locator('#error')).toHaveClass(/hidden/);
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Tab through form elements
    await page.keyboard.press('Tab');
    await expect(page.locator('input#originalUrl')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('input#suspectUrl')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('button[type="submit"]')).toBeFocused();
    
    // Test Enter key submission
    await page.fill('input#originalUrl', 'https://via.placeholder.com/300x200.jpg');
    await page.fill('input#suspectUrl', 'https://via.placeholder.com/300x200.jpg');
    
    await page.locator('input#suspectUrl').press('Enter');
    await expect(page.locator('#loading')).toBeVisible();
  });
});