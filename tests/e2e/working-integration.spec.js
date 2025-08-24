const { test, expect } = require('@playwright/test');

test.describe('Working Integration Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Media Manipulation Detection');
  });

  test('should display the main page correctly', async ({ page }) => {
    await expect(page).toHaveTitle('Media Manipulation Detection');
    await expect(page.locator('h1')).toContainText('Media Manipulation Detection');
    await expect(page.locator('form#detectionForm')).toBeVisible();
    await expect(page.locator('input#originalUrl')).toBeVisible();
    await expect(page.locator('input#suspectUrl')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should handle invalid URLs and show proper error', async ({ page }) => {
    // Fill form with URLs that pass HTML5 validation but fail backend validation
    await page.fill('input#originalUrl', 'http://not-a-real-url');
    await page.fill('input#suspectUrl', 'http://also-not-real');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should eventually show error (the API call is very fast, so loading might not be visible)
    await expect(page.locator('#error')).toBeVisible({ timeout: 15000 });
    
    // Error should contain meaningful message from backend
    const errorText = await page.locator('#errorContent').textContent();
    expect(errorText).toContain('Failed to download media');
  });

  test('should clear previous results when submitting new form', async ({ page }) => {
    // First submission with invalid URLs
    await page.fill('input#originalUrl', 'http://not-a-url-1');
    await page.fill('input#suspectUrl', 'http://not-a-url-2');
    await page.click('button[type="submit"]');
    
    // Wait for error to appear
    await expect(page.locator('#error')).toBeVisible({ timeout: 15000 });
    
    // Now submit a new form
    await page.fill('input#originalUrl', 'http://still-not-a-url-3');
    await page.fill('input#suspectUrl', 'http://still-not-a-url-4');
    await page.click('button[type="submit"]');
    
    // Previous error should be hidden, loading should show
    await expect(page.locator('#error')).toHaveClass(/hidden/);
    await expect(page.locator('#loading')).toBeVisible();
    
    // Should get new error
    await expect(page.locator('#error')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#loading')).toHaveClass(/hidden/);
  });

  test('should validate form inputs using HTML5 validation', async ({ page }) => {
    const analyzeButton = page.locator('button[type="submit"]');
    
    // Try submitting empty form
    await analyzeButton.click();
    
    // Check HTML5 validation kicks in
    const originalInput = page.locator('input#originalUrl');
    const suspectInput = page.locator('input#suspectUrl');
    
    const originalValid = await originalInput.evaluate(el => el.validity.valid);
    const suspectValid = await suspectInput.evaluate(el => el.validity.valid);
    
    expect(originalValid).toBe(false);
    expect(suspectValid).toBe(false);
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

  test('should handle keyboard navigation properly', async ({ page }) => {
    // Tab through form elements
    await page.keyboard.press('Tab');
    await expect(page.locator('input#originalUrl')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('input#suspectUrl')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('button[type="submit"]')).toBeFocused();
    
    // Test Enter key submission
    await page.fill('input#originalUrl', 'http://invalid-url-1');
    await page.fill('input#suspectUrl', 'http://invalid-url-2');
    
    await page.locator('input#suspectUrl').press('Enter');
    await expect(page.locator('#loading')).toBeVisible();
  });

  test('should maintain form state during API call', async ({ page }) => {
    // Fill form
    await page.fill('input#originalUrl', 'http://test-url-1');
    await page.fill('input#suspectUrl', 'http://test-url-2');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // During loading, form should still be visible and values preserved
    await expect(page.locator('#loading')).toBeVisible();
    await expect(page.locator('form#detectionForm')).toBeVisible();
    await expect(page.locator('input#originalUrl')).toHaveValue('http://test-url-1');
    await expect(page.locator('input#suspectUrl')).toHaveValue('http://test-url-2');
  });
});