const { test, expect } = require('@playwright/test');

test.describe('Simplified Integration Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Media Manipulation Detection');
  });

  test('should display main interface correctly', async ({ page }) => {
    await expect(page).toHaveTitle('Media Manipulation Detection');
    await expect(page.locator('h1')).toContainText('Media Manipulation Detection');
    await expect(page.locator('form#detectionForm')).toBeVisible();
    await expect(page.locator('input#originalUrl')).toBeVisible();
    await expect(page.locator('input#suspectUrl')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show error for invalid URLs', async ({ page }) => {
    // Use invalid domains that will cause network errors
    await page.fill('input#originalUrl', 'http://invalid-domain-test-12345.fake/image.jpg');
    await page.fill('input#suspectUrl', 'http://another-invalid-domain-67890.fake/image.jpg');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should eventually show error
    await expect(page.locator('#error')).toBeVisible({ timeout: 15000 });
    
    // Error should contain meaningful message
    const errorText = await page.locator('#errorContent').textContent();
    expect(errorText).toBeTruthy();
    expect(errorText.length).toBeGreaterThan(10);
  });

  test('should validate empty form submission', async ({ page }) => {
    // Try submitting empty form
    await page.click('button[type="submit"]');
    
    // HTML5 validation should prevent submission
    const originalInput = page.locator('input#originalUrl');
    const suspectInput = page.locator('input#suspectUrl');
    
    const originalValid = await originalInput.evaluate(el => el.validity.valid);
    const suspectValid = await suspectInput.evaluate(el => el.validity.valid);
    
    expect(originalValid).toBe(false);
    expect(suspectValid).toBe(false);
  });

  test('should maintain form values after failed submission', async ({ page }) => {
    const testUrl1 = 'http://test-url-1.fake/image.jpg';
    const testUrl2 = 'http://test-url-2.fake/image.jpg';
    
    // Fill form
    await page.fill('input#originalUrl', testUrl1);
    await page.fill('input#suspectUrl', testUrl2);
    
    // Submit form (will fail)
    await page.click('button[type="submit"]');
    
    // Form values should be preserved
    await expect(page.locator('input#originalUrl')).toHaveValue(testUrl1);
    await expect(page.locator('input#suspectUrl')).toHaveValue(testUrl2);
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Tab through form elements
    await page.keyboard.press('Tab');
    await expect(page.locator('input#originalUrl')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('input#suspectUrl')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('button[type="submit"]')).toBeFocused();
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.container')).toBeVisible();
    await expect(page.locator('form#detectionForm')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('.container')).toBeVisible();
    await expect(page.locator('form#detectionForm')).toBeVisible();
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    // Check labels are associated with inputs
    await expect(page.locator('label[for="originalUrl"]')).toBeVisible();
    await expect(page.locator('label[for="suspectUrl"]')).toBeVisible();
    
    // Check inputs have proper attributes
    await expect(page.locator('input#originalUrl')).toHaveAttribute('type', 'url');
    await expect(page.locator('input#suspectUrl')).toHaveAttribute('type', 'url');
    await expect(page.locator('input#originalUrl')).toHaveAttribute('required');
    await expect(page.locator('input#suspectUrl')).toHaveAttribute('required');
  });

  test('should handle form state during submission attempt', async ({ page }) => {
    // Fill form
    await page.fill('input#originalUrl', 'http://test-example.fake/image1.jpg');
    await page.fill('input#suspectUrl', 'http://test-example.fake/image2.jpg');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Form should still be visible and functional
    await expect(page.locator('form#detectionForm')).toBeVisible();
    await expect(page.locator('input#originalUrl')).toBeVisible();
    await expect(page.locator('input#suspectUrl')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});