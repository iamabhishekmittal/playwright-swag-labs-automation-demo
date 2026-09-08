import { expect, test, type Page } from '@playwright/test';

const backpackName = 'Sauce Labs Backpack';

function getCredentials() {
  const username = process.env.TEST_USER_USERNAME;
  const password = process.env.TEST_USER_PASSWORD;

  if (!username || !password) {
    const missingVariables = [
      !username ? 'TEST_USER_USERNAME' : undefined,
      !password ? 'TEST_USER_PASSWORD' : undefined,
    ].filter((name): name is string => Boolean(name));

    throw new Error(
      `Missing required environment variable(s): ${missingVariables.join(', ')}`,
    );
  }

  return { username, password };
}

async function login(page: Page) {
  const { username, password } = getCredentials();

  await page.goto('/');
  await page.getByPlaceholder('Username').fill(username);
  await page.getByPlaceholder('Password').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL((url) => url.pathname === '/inventory.html');
}

test('required checkout fields prevent continuation', async ({ page }) => {
  await login(page);

  const backpackItem = page.getByTestId('inventory-item').filter({
    has: page.getByText(backpackName, { exact: true }),
  });
  await backpackItem.getByRole('button', { name: 'Add to cart' }).click();
  await page.getByTestId('shopping-cart-link').click();
  await page.getByRole('button', { name: 'Checkout' }).click();

  await expect(page).toHaveURL(
    (url) => url.pathname === '/checkout-step-one.html',
  );

  const firstName = page.getByPlaceholder('First Name');
  const lastName = page.getByPlaceholder('Last Name');
  const postalCode = page.getByPlaceholder('Zip/Postal Code');

  await expect(firstName).toHaveValue('');
  await expect(lastName).toHaveValue('');
  await expect(postalCode).toHaveValue('');
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(
    page.getByRole('heading', { name: 'Error: First Name is required' }),
  ).toBeVisible();
  await expect(page).toHaveURL(
    (url) => url.pathname === '/checkout-step-one.html',
  );
  await expect(firstName).toBeVisible();
  await expect(lastName).toBeVisible();
  await expect(postalCode).toBeVisible();
  await expect(page).not.toHaveURL(
    (url) => url.pathname === '/checkout-step-two.html',
  );
});

test('product name and price remain consistent across inventory, cart and checkout', async ({
  page,
}) => {
  await login(page);

  const inventoryItem = page.getByTestId('inventory-item').filter({
    has: page.getByText(backpackName, { exact: true }),
  });
  const inventoryName = inventoryItem.getByText(backpackName, { exact: true });
  const inventoryPrice = inventoryItem.getByTestId('inventory-item-price');

  await expect(inventoryName).toBeVisible();
  await expect(inventoryPrice).toBeVisible();
  const displayedName = (await inventoryName.innerText()).trim();
  const displayedPrice = (await inventoryPrice.innerText()).trim();

  await inventoryItem.getByRole('button', { name: 'Add to cart' }).click();
  await page.getByTestId('shopping-cart-link').click();

  const cartItem = page.getByTestId('inventory-item').filter({
    has: page.getByText(displayedName, { exact: true }),
  });
  await expect(cartItem.getByText(displayedName, { exact: true })).toBeVisible();
  await expect(cartItem.getByText(displayedPrice, { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Checkout' }).click();
  await page.getByPlaceholder('First Name').fill('Test');
  await page.getByPlaceholder('Last Name').fill('User');
  await page.getByPlaceholder('Zip/Postal Code').fill('2000');
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page).toHaveURL(
    (url) => url.pathname === '/checkout-step-two.html',
  );

  const overviewItem = page.getByTestId('inventory-item').filter({
    has: page.getByText(displayedName, { exact: true }),
  });
  await expect(
    overviewItem.getByText(displayedName, { exact: true }),
  ).toBeVisible();
  await expect(
    overviewItem.getByText(displayedPrice, { exact: true }),
  ).toBeVisible();
  await expect(page.getByTestId('subtotal-label')).toHaveText(
    `Item total: ${displayedPrice}`,
  );
});

test('logout returns the user to login and protects the inventory page', async ({ page }) => {
  await login(page);

  await page.getByRole('button', { name: 'Open Menu' }).click();
  await page.getByRole('link', { name: 'Logout' }).click();

  await expect(page).toHaveURL((url) => url.pathname === '/');
  await expect(page.getByPlaceholder('Username')).toBeVisible();
  await expect(page.getByPlaceholder('Password')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();

  await page.goto('/inventory.html');

  await expect(page).toHaveURL((url) => url.pathname === '/');
  await expect(page.getByText('Products', { exact: true })).not.toBeVisible();
  await expect(
    page.getByRole('heading', {
      name: "Epic sadface: You can only access '/inventory.html' when you are logged in.",
    }),
  ).toBeVisible();
});
