# Swag Labs Playwright Automation Portfolio Project

[![Playwright Tests](https://github.com/iamabhishekmittal/playwright-swag-labs-automation-demo/actions/workflows/playwright.yml/badge.svg)](https://github.com/iamabhishekmittal/playwright-swag-labs-automation-demo/actions/workflows/playwright.yml)

## Project overview

This independent personal portfolio project demonstrates browser-test automation with Playwright and TypeScript against [SauceDemo](https://www.saucedemo.com/), also known as Swag Labs.

SauceDemo is a third-party public training application. It is not owned, maintained or developed by the owner of this repository.

## Current scope

- 8 focused functional scenarios
- 1 complete checkout end-to-end (E2E) journey
- 9 scenarios across Chromium, Firefox and WebKit
- 27 cross-browser executions: `9 scenarios × 3 browser engines = 27 executions`
- Latest local validation: 27/27 passing executions
- GitHub Actions continuous integration (CI)
- Playwright HTML reporting and tracing on the first retry
- Playwright UI Mode and Inspector for interactive debugging

## Technology stack

- Playwright Test
- TypeScript
- Node.js and npm
- Chromium, Firefox and WebKit
- `dotenv` for local environment configuration
- GitHub Actions for CI

## Test strategy

The functional tests isolate authentication, inventory, cart, checkout-validation and session behaviours. The E2E test connects the main customer journey from login through order completion and logout.

Each test runs in a fresh Playwright browser context and authenticates independently. This keeps scenarios isolated and avoids sharing browser state between tests.

## Test coverage

| Type | Scenario | Primary validation |
| --- | --- | --- |
| Functional | Successful login displays the product inventory | Standard-user authentication and inventory access |
| Functional | Invalid password displays an error and remains on the login page | Invalid-credential handling |
| Functional | Locked-out user is denied access | Account restriction handling |
| Functional | Products sort from lowest price to highest price | Complete numeric price ordering |
| Functional | Adding two products and removing one updates the cart | Cart badge, contents, prices, removal and item count |
| Functional | Required checkout fields prevent continuation | Required-field validation and route protection |
| Functional | Product name and price remain consistent across inventory, cart and checkout | Cross-page product-data integrity |
| Functional | Logout returns the user to login and protects the inventory page | Session termination and protected-route behaviour |
| E2E | Standard customer completes the full checkout journey | Login, sorting, cart changes, checkout totals, completion and logout |

## Primary E2E journey

The primary journey is reported through named `test.step()` stages:

1. Log in as the standard training user.
2. Sort products from low to high price.
3. Add two products and verify the cart.
4. Remove one product.
5. Enter synthetic customer information.
6. Verify the remaining product and order summary.
7. Complete the order.
8. Log out to clean up authenticated state.

The summary validation independently calculates the item subtotal, 8% tax with currency rounding, and final total before comparing them with the displayed values.

## Design and reliability decisions

- User-facing roles, visible text, placeholders and SauceDemo `data-test` attributes are preferred over brittle implementation selectors.
- Product interactions are scoped to the relevant inventory, cart or checkout item container.
- Web-first assertions wait for expected UI state.
- URL assertions compare exact pathnames.
- Sorting validation compares all displayed numeric prices with an independently sorted copy.
- Checkout totals are validated both textually and numerically.
- Fixed sleeps, forced clicks and XPath selectors are avoided.
- Environment variables are validated by name without logging their values.
- The suite remains intentionally small; its limited duplication does not yet justify Page Objects or custom fixture architecture.

## Project structure

```text
.
|-- .github/workflows/playwright.yml
|-- docs/demo-guide.md
|-- tests/
|   |-- e2e/complete-checkout.spec.ts
|   `-- functional/
|       |-- checkout-logout.spec.ts
|       |-- inventory-cart.spec.ts
|       `-- login.spec.ts
|-- .env.example
|-- .gitignore
|-- LICENSE
|-- package.json
|-- package-lock.json
|-- playwright.config.ts
`-- README.md
```

## Prerequisites

- Node.js 20 or newer; CI uses Node.js 24
- npm
- Git

## Installation

From the repository root:

```bash
npm ci
npx playwright install
```

On Linux or in CI, install browser system dependencies as well:

```bash
npx playwright install --with-deps
```

## Environment configuration

Create a local `.env` file from the tracked template:

```powershell
Copy-Item .env.example .env
```

On macOS or Linux:

```bash
cp .env.example .env
```

Set values for:

- `BASE_URL`
- `TEST_USER_USERNAME`
- `TEST_USER_PASSWORD`
- `LOCKED_USER_USERNAME`

The credential entries use placeholders, while the base URL identifies the public SauceDemo training site. Keep `.env` local and never commit real credentials.

## Commands

| Command | Purpose |
| --- | --- |
| `npm test` | Run all 9 scenarios across all 3 browser projects |
| `npm run test:chromium` | Run all scenarios in Chromium |
| `npm run test:functional` | Run the 8 functional scenarios in Chromium |
| `npm run test:e2e` | Run the primary E2E journey in Chromium |
| `npm run test:headed` | Run the primary E2E journey in headed Chromium |
| `npm run test:ui` | Open Playwright UI Mode |
| `npm run report` | Open the most recently generated HTML report |

For the Playwright Inspector:

```bash
npx playwright test tests/e2e/complete-checkout.spec.ts --project=chromium --debug
```

## Cross-browser execution

The default command runs every scenario in Chromium, Firefox and WebKit:

```bash
npm test
```

This produces 27 executions:

```text
9 scenarios × 3 browser engines = 27 executions
```

## Reports and debugging

Playwright writes its HTML report to `playwright-report`:

```bash
npm run report
```

Tracing is configured for the first retry. On CI, failed initial attempts can therefore provide trace timelines, DOM snapshots, network activity and action history for investigation.

UI Mode and the Playwright Inspector support interactive local debugging. Generated reports, traces and test results are ignored by Git.

## GitHub Actions CI

The CI workflow runs:

- On pushes to `main`
- On pull requests targeting `main`
- Through manual `workflow_dispatch`

It uses Ubuntu and Node.js 24, installs dependencies with `npm ci`, installs the three Playwright browser engines and their system dependencies, and runs the complete suite through `npm test`.

The HTML report is uploaded even when tests fail and retained for 14 days. The workflow performs continuous integration only; it does not deploy or publish an application.

## Security

- `.env` and environment variants are excluded from source control, while `.env.example` remains tracked.
- The workflow contains only SauceDemo's public training credentials.
- Real credentials belong in GitHub Secrets and should be passed through workflow environment variables.
- Reports and traces can contain entered browser data and should be reviewed before external sharing.

## Limitations and future improvements

This focused portfolio suite does not currently include:

- Page Object Model or reusable custom fixtures
- API testing
- Visual-regression testing
- Performance or load testing
- Formal accessibility testing
- Docker
- Scheduled regression runs
- Application deployment or continuous delivery

If the suite grows, repeated setup and page interactions could be moved into fixtures or Page Objects. Additional test layers or scheduled execution should be introduced only when project scope and risk justify them.

## Licence

This project is available under the [MIT License](LICENSE).
