const { test, expect } = require('@playwright/test');

test.describe('Full Stack Integration Tests', () => {
  
  // Test URLs for actual image comparison
  const IDENTICAL_IMAGES = {
    original: 'https://via.placeholder.com/400x300/FF0000/FFFFFF.png?text=Test+Image',
    suspect: 'https://via.placeholder.com/400x300/FF0000/FFFFFF.png?text=Test+Image'
  };

  const DIFFERENT_IMAGES = {
    original: 'https://via.placeholder.com/400x300/FF0000/FFFFFF.png?text=Original',
    suspect: 'https://via.placeholder.com/400x300/00FF00/000000.png?text=Different'
  };

  const SLIGHTLY_DIFFERENT_IMAGES = {
    original: 'https://via.placeholder.com/400x300/FF0000/FFFFFF.png?text=Original',
    suspect: 'https://via.placeholder.com/400x300/FF0000/FFFFFF.png?text=Suspect'
  };

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to be fully loaded
    await expect(page.locator('h1')).toContainText('Media Manipulation Detection');
  });

  test('should successfully analyze identical images', async ({ page }) => {
    // Fill form with identical images
    await page.fill('input#originalUrl', IDENTICAL_IMAGES.original);
    await page.fill('input#suspectUrl', IDENTICAL_IMAGES.suspect);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for loading to appear
    await expect(page.locator('#loading')).toBeVisible();
    
    // Wait for results (give it up to 30 seconds for image processing)
    await expect(page.locator('#results')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('#loading')).toHaveClass(/hidden/);
    
    // Check results
    await expect(page.locator('#results')).toContainText('No Manipulation Detected');
    await expect(page.locator('#results')).toContainText('Similarity Score');
    await expect(page.locator('#results')).toContainText('Media Type: image');
    await expect(page.locator('#results')).toContainText('Original Dimensions');
    await expect(page.locator('#results')).toContainText('Suspect Dimensions');
    
    // The score should be high for identical images
    const scoreText = await page.locator('#results').textContent();
    const scoreMatch = scoreText.match(/Similarity Score:\s*([\d.]+)/);
    if (scoreMatch) {
      const score = parseFloat(scoreMatch[1]);
      expect(score).toBeGreaterThan(0.9); // Should be very similar
    }
  });

  test('should detect differences in different images', async ({ page }) => {
    // Fill form with different images
    await page.fill('input#originalUrl', DIFFERENT_IMAGES.original);
    await page.fill('input#suspectUrl', DIFFERENT_IMAGES.suspect);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for results
    await expect(page.locator('#results')).toBeVisible({ timeout: 30000 });
    
    // Check that some difference is detected (score should be lower)
    const scoreText = await page.locator('#results').textContent();
    const scoreMatch = scoreText.match(/Similarity Score:\s*([\d.]+)/);
    if (scoreMatch) {
      const score = parseFloat(scoreMatch[1]);
      expect(score).toBeLessThan(1.0); // Should show some difference
    }
    
    // Should show analysis results
    await expect(page.locator('#results')).toContainText('Similarity Score');
    await expect(page.locator('#results')).toContainText('Analysis');
  });

  test('should handle invalid URLs gracefully', async ({ page }) => {
    // Fill form with invalid URLs
    await page.fill('input#originalUrl', 'https://nonexistent-domain-12345.com/image.jpg');
    await page.fill('input#suspectUrl', 'https://another-nonexistent-domain-67890.com/image.jpg');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for loading
    await expect(page.locator('#loading')).toBeVisible();
    
    // Should eventually show an error
    await expect(page.locator('#error')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('#loading')).toHaveClass(/hidden/);
    
    // Error should contain meaningful message
    await expect(page.locator('#error')).toContainText('Error');
    
    // Error content should not be empty
    const errorContent = await page.locator('#errorContent').textContent();
    expect(errorContent.trim().length).toBeGreaterThan(0);
  });

  test('should handle non-image URLs', async ({ page }) => {
    // Fill form with non-image URLs
    await page.fill('input#originalUrl', 'https://www.google.com');
    await page.fill('input#suspectUrl', 'https://www.example.com');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should show error for unsupported content
    await expect(page.locator('#error')).toBeVisible({ timeout: 30000 });
    
    const errorContent = await page.locator('#errorContent').textContent();
    expect(errorContent.trim().length).toBeGreaterThan(0);
  });

  test('should display image previews correctly', async ({ page }) => {
    // Fill in URLs
    await page.fill('input#originalUrl', IDENTICAL_IMAGES.original);
    await page.fill('input#suspectUrl', IDENTICAL_IMAGES.suspect);
    
    // Wait for images to load
    await page.waitForTimeout(2000);
    
    // Check if previews are visible
    const originalPreview = page.locator('#originalPreview');
    const suspectPreview = page.locator('#suspectPreview');
    
    await expect(originalPreview).toBeVisible();
    await expect(suspectPreview).toBeVisible();
    
    // Check they have the correct src attributes
    await expect(originalPreview).toHaveAttribute('src', IDENTICAL_IMAGES.original);
    await expect(suspectPreview).toHaveAttribute('src', IDENTICAL_IMAGES.suspect);
  });

  test('should show detailed results information', async ({ page }) => {
    // Fill form with test images
    await page.fill('input#originalUrl', SLIGHTLY_DIFFERENT_IMAGES.original);
    await page.fill('input#suspectUrl', SLIGHTLY_DIFFERENT_IMAGES.suspect);
    
    // Submit and wait for results
    await page.click('button[type="submit"]');
    await expect(page.locator('#results')).toBeVisible({ timeout: 30000 });
    
    // Check all expected result fields are present
    const resultsText = await page.locator('#results').textContent();
    
    expect(resultsText).toContain('Similarity Score:');
    expect(resultsText).toContain('Analysis:');
    expect(resultsText).toContain('Media Type:');
    expect(resultsText).toContain('Original Dimensions:');
    expect(resultsText).toContain('Suspect Dimensions:');
    
    // Check that dimensions are shown in proper format (width × height)
    expect(resultsText).toMatch(/\d+\s*×\s*\d+/);
  });

  test('should handle form resubmission correctly', async ({ page }) => {
    // First submission
    await page.fill('input#originalUrl', IDENTICAL_IMAGES.original);
    await page.fill('input#suspectUrl', IDENTICAL_IMAGES.suspect);
    await page.click('button[type="submit"]');
    
    // Wait for first results
    await expect(page.locator('#results')).toBeVisible({ timeout: 30000 });
    
    // Clear and submit different images
    await page.fill('input#originalUrl', DIFFERENT_IMAGES.original);
    await page.fill('input#suspectUrl', DIFFERENT_IMAGES.suspect);
    await page.click('button[type="submit"]');
    
    // Should hide previous results and show loading
    await expect(page.locator('#loading')).toBeVisible();
    await expect(page.locator('#results')).toHaveClass(/hidden/);
    
    // Should get new results
    await expect(page.locator('#results')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('#loading')).toHaveClass(/hidden/);
  });

  test('should maintain UI state during analysis', async ({ page }) => {
    // Fill form
    await page.fill('input#originalUrl', IDENTICAL_IMAGES.original);
    await page.fill('input#suspectUrl', IDENTICAL_IMAGES.suspect);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // During loading, form should still be visible and functional
    await expect(page.locator('#loading')).toBeVisible();
    await expect(page.locator('form#detectionForm')).toBeVisible();
    await expect(page.locator('input#originalUrl')).toBeVisible();
    await expect(page.locator('input#suspectUrl')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Image previews should still be visible
    await expect(page.locator('#originalPreview')).toBeVisible();
    await expect(page.locator('#suspectPreview')).toBeVisible();
  });
});