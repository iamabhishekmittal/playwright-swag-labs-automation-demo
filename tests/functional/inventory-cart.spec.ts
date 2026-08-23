import { expect, test, type Page } from '@playwright/test';

const backpack = {
  name: 'Sauce Labs Backpack',
  price: '$29.99',
};

const bikeLight = {
  name: 'Sauce Labs Bike Light',
  price: '$9.99',
};

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

test('products sort from lowest price to highest price', async ({ page }) => {
  await login(page);

  await page.getByRole('combobox').selectOption({ label: 'Price (low to high)' });

  const displayedPrices = page.getByTestId('inventory-item-price');
  await expect(displayedPrices.first()).toHaveText('$7.99');
  await expect(displayedPrices.last()).toHaveText('$49.99');

  const prices = (await displayedPrices.allTextContents()).map((price) =>
    Number(price.replace('$', '')),
  );
  const ascendingPrices = [...prices].sort((first, second) => first - second);

  expect(prices).toEqual(ascendingPrices);
});

test('adding two products and removing one updates the cart', async ({ page }) => {
  await login(page);
  await expect(page.getByText('Products', { exact: true })).toBeVisible();

  const inventoryItems = page.getByTestId('inventory-item');
  const backpackItem = inventoryItems.filter({
    has: page.getByText(backpack.name, { exact: true }),
  });
  const bikeLightItem = inventoryItems.filter({
    has: page.getByText(bikeLight.name, { exact: true }),
  });

  await backpackItem.getByRole('button', { name: 'Add to cart' }).click();
  await bikeLightItem.getByRole('button', { name: 'Add to cart' }).click();
  await expect(page.getByTestId('shopping-cart-badge')).toHaveText('2');

  await page.getByTestId('shopping-cart-link').click();
  await expect(page).toHaveURL((url) => url.pathname === '/cart.html');

  const cartItems = page.getByTestId('inventory-item');
  const backpackCartItem = cartItems.filter({
    has: page.getByText(backpack.name, { exact: true }),
  });
  const bikeLightCartItem = cartItems.filter({
    has: page.getByText(bikeLight.name, { exact: true }),
  });

  await expect(backpackCartItem.getByText(backpack.name, { exact: true })).toBeVisible();
  await expect(backpackCartItem.getByText(backpack.price, { exact: true })).toBeVisible();
  await expect(bikeLightCartItem.getByText(bikeLight.name, { exact: true })).toBeVisible();
  await expect(bikeLightCartItem.getByText(bikeLight.price, { exact: true })).toBeVisible();

  await bikeLightCartItem.getByRole('button', { name: 'Remove' }).click();

  await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
  await expect(backpackCartItem.getByText(backpack.name, { exact: true })).toBeVisible();
  await expect(bikeLightCartItem).not.toBeVisible();
  await expect(cartItems).toHaveCount(1);
});
