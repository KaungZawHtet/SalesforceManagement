import ***REMOVED*** test, expect, type Page ***REMOVED*** from '@playwright/test';

const initialAccount = ***REMOVED***
  id: '001-initial',
  name: 'Initial Account',
  phone: '+1 555-0100',
  website: 'https://initial.example.com',
  industry: 'Technology',
***REMOVED***;

const createdAccount = ***REMOVED***
  id: '001-created',
  name: 'Name Only Account',
***REMOVED***;

async function mockAccounts(
  page: Page,
  handler: (method: string, requestBody: string | undefined) => ***REMOVED***
    status: number;
    body: unknown;
  ***REMOVED***,
) ***REMOVED***
  await page.route('**/api/accounts*', async (route) => ***REMOVED***
    const response = handler(
      route.request().method(),
      route.request().postData() ?? undefined,
    );
    await route.fulfill(***REMOVED***
      status: response.status,
      contentType: 'application/json',
      body: JSON.stringify(response.body),
***REMOVED***);
  ***REMOVED***);
***REMOVED***

test.describe('Salesforce Account Manager', () => ***REMOVED***
  test('loads the account manager and renders the account list', async (***REMOVED***
    page,
  ***REMOVED***) => ***REMOVED***
    await mockAccounts(page, () => (***REMOVED***
      status: 200,
      body: ***REMOVED*** data: [initialAccount], meta: ***REMOVED*** total: 1, limit: 100, offset: 0 ***REMOVED*** ***REMOVED***,
***REMOVED***));

    await page.goto('/');

    await expect(page).toHaveTitle(/Salesforce Account Manager/);
    await expect(
      page.getByRole('heading', ***REMOVED*** name: 'Salesforce Accounts' ***REMOVED***),
    ).toBeVisible();
    await expect(page.getByText('Initial Account')).toBeVisible();
  ***REMOVED***);

  test('requires an account name', async (***REMOVED*** page ***REMOVED***) => ***REMOVED***
    await mockAccounts(page, () => (***REMOVED***
      status: 200,
      body: ***REMOVED*** data: [], meta: ***REMOVED*** total: 0, limit: 100, offset: 0 ***REMOVED*** ***REMOVED***,
***REMOVED***));

    await page.goto('/');
    await page.getByRole('button', ***REMOVED*** name: 'Create Account' ***REMOVED***).click();

    await expect(page.getByLabel('Name *')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  ***REMOVED***);

  test('submits a name-only account and refreshes the complete list', async (***REMOVED***
    page,
  ***REMOVED***) => ***REMOVED***
    let getCount = 0;
    let submittedBody: unknown;
    await mockAccounts(page, (method, requestBody) => ***REMOVED***
      if (method === 'POST') ***REMOVED***
        submittedBody = requestBody ? JSON.parse(requestBody) : undefined;
        return ***REMOVED*** status: 201, body: ***REMOVED*** data: createdAccount ***REMOVED*** ***REMOVED***;
  ***REMOVED***
      getCount += 1;
      const data = getCount === 1 ? [initialAccount] : [initialAccount, createdAccount];
      return ***REMOVED***
        status: 200,
        body: ***REMOVED*** data, meta: ***REMOVED*** total: data.length, limit: 100, offset: 0 ***REMOVED*** ***REMOVED***,
  ***REMOVED***;
***REMOVED***);

    await page.goto('/');
    await page.getByLabel('Name *').fill('Name Only Account');
    await page.getByRole('button', ***REMOVED*** name: 'Create Account' ***REMOVED***).click();

    await expect(page.getByText('Name Only Account')).toBeVisible();
    await expect.poll(() => submittedBody).toEqual(***REMOVED*** name: 'Name Only Account' ***REMOVED***);
    expect(getCount).toBeGreaterThanOrEqual(2);
    await expect(page.getByText('Account created successfully')).toBeVisible();
  ***REMOVED***);

  test('shows a friendly create API error', async (***REMOVED*** page ***REMOVED***) => ***REMOVED***
    await mockAccounts(page, (method) =>
      method === 'POST'
        ? ***REMOVED***
            status: 503,
            body: ***REMOVED*** statusCode: 503, message: 'upstream unavailable' ***REMOVED***,
      ***REMOVED***
        : ***REMOVED***
            status: 200,
            body: ***REMOVED*** data: [], meta: ***REMOVED*** total: 0, limit: 100, offset: 0 ***REMOVED*** ***REMOVED***,
      ***REMOVED***
    );

    await page.goto('/');
    await page.getByLabel('Name *').fill('Will Fail');
    await page.getByRole('button', ***REMOVED*** name: 'Create Account' ***REMOVED***).click();

    await expect(
      page.getByText('The server is currently unavailable. Please try again shortly.'),
    ).toBeVisible();
  ***REMOVED***);

  test('shows the list error state when the account request fails', async (***REMOVED***
    page,
  ***REMOVED***) => ***REMOVED***
    await mockAccounts(page, () => (***REMOVED***
      status: 503,
      body: ***REMOVED*** statusCode: 503, message: 'upstream unavailable' ***REMOVED***,
***REMOVED***));

    await page.goto('/');

    await expect(
      page.getByText('The server is currently unavailable. Please try again shortly.'),
    ).toBeVisible();
  ***REMOVED***);
***REMOVED***);
