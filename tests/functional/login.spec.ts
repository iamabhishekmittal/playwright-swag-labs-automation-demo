import { expect, test, type Page } from '@playwright/test';

const invalidPassword = 'invalid_password_123';

function getCredentials() {
  const username = process.env.TEST_USER_USERNAME;
  const password = process.env.TEST_USER_PASSWORD;
  const lockedUsername = process.env.LOCKED_USER_USERNAME;

  if (!username || !password || !lockedUsername) {
    const missingVariables = [
      !username ? 'TEST_USER_USERNAME' : undefined,
      !password ? 'TEST_USER_PASSWORD' : undefined,
      !lockedUsername ? 'LOCKED_USER_USERNAME' : undefined,
    ].filter((name): name is string => Boolean(name));

    throw new Error(
      `Missing required environment variable(s): ${missingVariables.join(', ')}`,
    );
  }

  return { username, password, lockedUsername };
}

async function login(page: Page, username: string, password: string) {
  await page.getByPlaceholder('Username').fill(username);
  await page.getByPlaceholder('Password').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
}

test('successful login displays the product inventory', async ({ page }) => {
  const { username, password } = getCredentials();

  await page.goto('/');
  await login(page, username, password);

  await expect(page).toHaveURL((url) => url.pathname === '/inventory.html');
  await expect(page.getByText('Products', { exact: true })).toBeVisible();
  await expect(
    page.getByText('Sauce Labs Backpack', { exact: true }),
  ).toBeVisible();
});

test('invalid password displays an error and remains on login page', async ({ page }) => {
  const { username } = getCredentials();

  await page.goto('/');
  await login(page, username, invalidPassword);

  await expect(
    page.getByRole('heading', {
      name: 'Epic sadface: Username and password do not match any user in this service',
    }),
  ).toBeVisible();
  await expect(page).toHaveURL((url) => url.pathname === '/');
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
});

test('locked-out user is denied access', async ({ page }) => {
  const { lockedUsername, password } = getCredentials();

  await page.goto('/');
  await login(page, lockedUsername, password);

  await expect(
    page.getByRole('heading', {
      name: 'Epic sadface: Sorry, this user has been locked out.',
    }),
  ).toBeVisible();
  await expect(page).toHaveURL((url) => url.pathname === '/');
  await expect(page.getByText('Products', { exact: true })).not.toBeVisible();
});
