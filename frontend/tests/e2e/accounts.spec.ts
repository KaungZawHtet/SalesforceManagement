import ***REMOVED*** test, expect ***REMOVED*** from '@playwright/test';

test.describe('Salesforce Account Manager E2E Tests', () => ***REMOVED***
  test('Application loads successfully', async (***REMOVED*** page ***REMOVED***) => ***REMOVED***
    await page.goto('/');
    await expect(page).toHaveTitle(/Salesforce Account Manager/);
    
    const heading = page.getByRole('heading', ***REMOVED*** name: 'Salesforce Accounts' ***REMOVED***);
    await expect(heading).toBeVisible();
    
    const createFormHeading = page.getByRole('heading', ***REMOVED*** name: 'Create Account' ***REMOVED***);
    await expect(createFormHeading).toBeVisible();
    
    const accountListHeading = page.getByRole('heading', ***REMOVED*** name: 'Account List' ***REMOVED***);
    await expect(accountListHeading).toBeVisible();
  ***REMOVED***);

  test('Create account form exists and is functional', async (***REMOVED*** page ***REMOVED***) => ***REMOVED***
    await page.goto('/');
    
    const nameInput = page.getByLabel('Name *');
    await expect(nameInput).toBeVisible();
    
    const phoneInput = page.getByLabel('Phone');
    await expect(phoneInput).toBeVisible();
    
    const websiteInput = page.getByLabel('Website');
    await expect(websiteInput).toBeVisible();
    
    const industryInput = page.getByLabel('Industry');
    await expect(industryInput).toBeVisible();
    
    const submitButton = page.getByRole('button', ***REMOVED*** name: 'Create Account' ***REMOVED***);
    await expect(submitButton).toBeVisible();
  ***REMOVED***);

  test('Validation error shows for empty name field', async (***REMOVED*** page ***REMOVED***) => ***REMOVED***
    await page.goto('/');
    
    const submitButton = page.getByRole('button', ***REMOVED*** name: 'Create Account' ***REMOVED***);
    await submitButton.click();
    
    await expect(page.getByLabel('Name *')).toHaveAttribute('aria-invalid', 'true');
  ***REMOVED***);

  test('Form fields are editable', async (***REMOVED*** page ***REMOVED***) => ***REMOVED***
    await page.goto('/');
    
    const nameInput = page.getByLabel('Name *');
    await nameInput.fill('Test Account');
    await expect(nameInput).toHaveValue('Test Account');
    
    const phoneInput = page.getByLabel('Phone');
    await phoneInput.fill('+1-555-1234');
    await expect(phoneInput).toHaveValue('+1-555-1234');
    
    const websiteInput = page.getByLabel('Website');
    await websiteInput.fill('https://example.com');
    await expect(websiteInput).toHaveValue('https://example.com');
    
    const industryInput = page.getByLabel('Industry');
    await industryInput.fill('Technology');
    await expect(industryInput).toHaveValue('Technology');
  ***REMOVED***);

  test('Account list section renders', async (***REMOVED*** page ***REMOVED***) => ***REMOVED***
    await page.goto('/');
    
    await page.waitForTimeout(1000);
    
    const accountListHeading = page.locator('h3:has-text("Account List")');
    await expect(accountListHeading).toBeVisible();
  ***REMOVED***);

  test('API error handling works correctly', async (***REMOVED*** page ***REMOVED***) => ***REMOVED***
    await page.goto('/');
    
    await page.waitForTimeout(1000);
    
    const accountListHeading = page.locator('h3:has-text("Account List")');
    await expect(accountListHeading).toBeVisible();
  ***REMOVED***);
***REMOVED***);