import { test, expect, type Page } from '@playwright/test';

const initialAccount = {
  id: '001-initial',
  name: 'Initial Account',
  phone: '+1 555-0100',
  website: 'https://initial.example.com',
  industry: 'Technology',
};

const createdAccount = {
  id: '001-created',
  name: 'Name Only Account',
};

async function mockAccounts(
  page: Page,
  handler: (method: string, requestBody: string | undefined) => {
    status: number;
    body: unknown;
  },
) {
  await page.route('**/api/accounts*', async (route) => {
    const response = handler(
      route.request().method(),
      route.request().postData() ?? undefined,
    );
    await route.fulfill({
      status: response.status,
      contentType: 'application/json',
      body: JSON.stringify(response.body),
    });
  });
}

test.describe('Salesforce Account Manager', () => {
  test('loads the account manager and renders the account list', async ({ page }) => {
    await mockAccounts(page, () => ({
      status: 200,
      body: {
        data: [initialAccount],
        meta: { total: 1, limit: 100, offset: 0 },
      },
    }));

    await page.goto('/');

    await expect(page).toHaveTitle(/Salesforce Account Manager/);
    await expect(
      page.getByRole('heading', { name: 'Salesforce Accounts' }),
    ).toBeVisible();
    await expect(page.getByText('Initial Account')).toBeVisible();
  });

  test('requires an account name', async ({ page }) => {
    await mockAccounts(page, () => ({
      status: 200,
      body: {
        data: [],
        meta: { total: 0, limit: 100, offset: 0 },
      },
    }));

    await page.goto('/');
    await page.getByRole('button', { name: 'Create Account' }).click();

    await expect(page.getByLabel('Name *')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  test('submits a name-only account and refreshes the complete list', async ({ page }) => {
    let getCount = 0;
    let submittedBody: unknown;
    await mockAccounts(page, (method, requestBody) => {
      if (method === 'POST') {
        submittedBody = requestBody ? JSON.parse(requestBody) : undefined;
        return { status: 201, body: { data: createdAccount } };
      }
      getCount += 1;
      const data = getCount === 1 ? [initialAccount] : [initialAccount, createdAccount];
      return {
        status: 200,
        body: { data, meta: { total: data.length, limit: 100, offset: 0 } },
      };
    });

    await page.goto('/');
    await page.getByLabel('Name *').fill('Name Only Account');
    await page.getByRole('button', { name: 'Create Account' }).click();

    await expect(page.getByText('Name Only Account')).toBeVisible();
    await expect.poll(() => submittedBody).toEqual({ name: 'Name Only Account' });
    expect(getCount).toBeGreaterThanOrEqual(2);
    await expect(page.getByText('Account created successfully')).toBeVisible();
  });

  test('shows a friendly create API error', async ({ page }) => {
    await mockAccounts(page, (method) =>
      method === 'POST'
        ? {
            status: 503,
            body: { statusCode: 503, message: 'upstream unavailable' },
          }
        : {
            status: 200,
            body: {
              data: [],
              meta: { total: 0, limit: 100, offset: 0 },
            },
          },
    );

    await page.goto('/');
    await page.getByLabel('Name *').fill('Will Fail');
    await page.getByRole('button', { name: 'Create Account' }).click();

    await expect(
      page.getByText('The server is currently unavailable. Please try again shortly.'),
    ).toBeVisible();
  });

  test('shows the list error state when the account request fails', async ({ page }) => {
    await mockAccounts(page, () => ({
      status: 503,
      body: { statusCode: 503, message: 'upstream unavailable' },
    }));

    await page.goto('/');

    await expect(
      page.getByText('The server is currently unavailable. Please try again shortly.'),
    ).toBeVisible();
  });
});
