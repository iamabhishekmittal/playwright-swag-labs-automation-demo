import { expect, test, type Page } from '@playwright/test';

const onesie = {
  name: 'Sauce Labs Onesie',
  price: '$7.99',
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

function parseCurrency(label: string) {
  const match = label.match(/\$(\d+(?:\.\d{2})?)/);

  if (!match) {
    throw new Error('Unable to parse a currency value from the displayed summary.');
  }

  return Number(match[1]);
}

async function login(page: Page) {
  const { username, password } = getCredentials();

  await page.goto('/');
  await page.getByPlaceholder('Username').fill(username);
  await page.getByPlaceholder('Password').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
}

test('standard customer completes the full checkout journey', async ({ page }) => {
  await test.step('Login', async () => {
    await login(page);

    await expect(page).toHaveURL((url) => url.pathname === '/inventory.html');
    await expect(page.getByText('Products', { exact: true })).toBeVisible();
    await expect(page.getByTestId('inventory-list')).toBeVisible();
  });

  await test.step('Sort and select products', async () => {
    await page.getByRole('combobox').selectOption({ label: 'Price (low to high)' });
    await expect(page.getByRole('combobox')).toHaveValue('lohi');

    const priceLabels = page.getByTestId('inventory-item-price');
    const displayedPrices = (await priceLabels.allTextContents()).map((price) =>
      parseCurrency(price),
    );
    const ascendingPrices = [...displayedPrices].sort(
      (first, second) => first - second,
    );
    expect(displayedPrices).toEqual(ascendingPrices);

    const displayedNames = await page
      .getByTestId('inventory-item-name')
      .allTextContents();
    const onesiePosition = displayedNames.indexOf(onesie.name);
    const bikeLightPosition = displayedNames.indexOf(bikeLight.name);
    expect(onesiePosition).toBeGreaterThanOrEqual(0);
    expect(bikeLightPosition).toBeGreaterThanOrEqual(0);
    expect(onesiePosition).toBeLessThan(bikeLightPosition);

    const inventoryItems = page.getByTestId('inventory-item');
    const onesieItem = inventoryItems.filter({
      has: page.getByText(onesie.name, { exact: true }),
    });
    const bikeLightItem = inventoryItems.filter({
      has: page.getByText(bikeLight.name, { exact: true }),
    });

    await expect(onesieItem.getByText(onesie.price, { exact: true })).toBeVisible();
    await expect(
      bikeLightItem.getByText(bikeLight.price, { exact: true }),
    ).toBeVisible();
    await onesieItem.getByRole('button', { name: 'Add to cart' }).click();
    await bikeLightItem.getByRole('button', { name: 'Add to cart' }).click();
    await expect(page.getByTestId('shopping-cart-badge')).toHaveText('2');
  });

  await test.step('Verify cart', async () => {
    await page.getByTestId('shopping-cart-link').click();

    await expect(page).toHaveURL((url) => url.pathname === '/cart.html');

    const cartItems = page.getByTestId('inventory-item');
    const onesieCartItem = cartItems.filter({
      has: page.getByText(onesie.name, { exact: true }),
    });
    const bikeLightCartItem = cartItems.filter({
      has: page.getByText(bikeLight.name, { exact: true }),
    });

    await expect(
      onesieCartItem.getByText(onesie.name, { exact: true }),
    ).toBeVisible();
    await expect(
      onesieCartItem.getByText(onesie.price, { exact: true }),
    ).toBeVisible();
    await expect(
      bikeLightCartItem.getByText(bikeLight.name, { exact: true }),
    ).toBeVisible();
    await expect(
      bikeLightCartItem.getByText(bikeLight.price, { exact: true }),
    ).toBeVisible();
    await expect(cartItems).toHaveCount(2);
  });

  await test.step('Remove one product', async () => {
    const cartItems = page.getByTestId('inventory-item');
    const onesieCartItem = cartItems.filter({
      has: page.getByText(onesie.name, { exact: true }),
    });
    const bikeLightCartItem = cartItems.filter({
      has: page.getByText(bikeLight.name, { exact: true }),
    });

    await bikeLightCartItem.getByRole('button', { name: 'Remove' }).click();

    await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
    await expect(
      onesieCartItem.getByText(onesie.name, { exact: true }),
    ).toBeVisible();
    await expect(
      onesieCartItem.getByText(onesie.price, { exact: true }),
    ).toBeVisible();
    await expect(bikeLightCartItem).not.toBeVisible();
    await expect(cartItems).toHaveCount(1);
  });

  await test.step('Enter customer information', async () => {
    await page.getByRole('button', { name: 'Checkout' }).click();

    await expect(page).toHaveURL(
      (url) => url.pathname === '/checkout-step-one.html',
    );
    await page.getByPlaceholder('First Name').fill('Test');
    await page.getByPlaceholder('Last Name').fill('User');
    await page.getByPlaceholder('Zip/Postal Code').fill('2000');
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page).toHaveURL(
      (url) => url.pathname === '/checkout-step-two.html',
    );
  });

  await test.step('Verify order summary', async () => {
    const overviewItem = page.getByTestId('inventory-item').filter({
      has: page.getByText(onesie.name, { exact: true }),
    });
    await expect(
      overviewItem.getByText(onesie.name, { exact: true }),
    ).toBeVisible();
    await expect(
      overviewItem.getByText(onesie.price, { exact: true }),
    ).toBeVisible();

    const itemTotalLabel = page.getByTestId('subtotal-label');
    const taxLabel = page.getByTestId('tax-label');
    const totalLabel = page.getByTestId('total-label');

    await expect(itemTotalLabel).toHaveText('Item total: $7.99');
    await expect(taxLabel).toHaveText('Tax: $0.64');
    await expect(totalLabel).toHaveText('Total: $8.63');

    const itemTotal = parseCurrency(await itemTotalLabel.innerText());
    const tax = parseCurrency(await taxLabel.innerText());
    const finalTotal = parseCurrency(await totalLabel.innerText());
    const remainingProductPrice = parseCurrency(onesie.price);
    const expectedTax = Math.round(itemTotal * 0.08 * 100) / 100;

    expect(itemTotal).toBe(remainingProductPrice);
    expect(tax).toBe(expectedTax);
    expect(finalTotal).toBe(Number((itemTotal + tax).toFixed(2)));
  });

  await test.step('Complete order', async () => {
    await page.getByRole('button', { name: 'Finish' }).click();

    await expect(page).toHaveURL(
      (url) => url.pathname === '/checkout-complete.html',
    );
    await expect(
      page.getByRole('heading', { name: 'Thank you for your order!' }),
    ).toBeVisible();
    await expect(page.getByTestId('checkout-complete-container')).toBeVisible();
  });

  await test.step('Clean up authenticated state', async () => {
    await page.getByRole('button', { name: 'Open Menu' }).click();
    await page.getByRole('link', { name: 'Logout' }).click();

    await expect(page).toHaveURL((url) => url.pathname === '/');
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });
});
