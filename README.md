# Swag Labs Playwright Automation Portfolio Project

An independent portfolio project built with Playwright and TypeScript to validate critical customer journeys in the Swag Labs training application. The suite combines focused functional coverage with a complete end-to-end checkout journey and is ready for local demonstrations and GitHub Actions CI/CD.

## Application under test

The tests run against [Swag Labs](https://www.saucedemo.com), a public demonstration storefront designed for browser-automation practice.

## Technology stack

- Playwright Test with TypeScript
- Node.js 24 in CI
- Chromium, Firefox, and WebKit project configuration
- `dotenv` for local environment variables
- GitHub Actions for continuous integration
- Playwright HTML reports and traces

## Test coverage

| Layer | Scenario | Primary coverage |
| --- | --- | --- |
| Functional | Successful login displays the product inventory | Standard-user authentication and inventory access |
| Functional | Invalid password displays an error and remains on login page | Invalid-credential handling |
| Functional | Locked-out user is denied access | Account restriction handling |
| Functional | Products sort from lowest price to highest price | Complete numeric price ordering |
| Functional | Adding two products and removing one updates the cart | Cart badge, contents, prices, removal, and item count |
| Functional | Required checkout fields prevent continuation | Required-field validation and route protection |
| Functional | Product name and price remain consistent across inventory, cart and checkout | Cross-page product-data integrity |
| Functional | Logout returns the user to login and protects the inventory page | Session termination and authenticated-route protection |
| End-to-end | Standard customer completes the full checkout journey | Login, sorting, cart changes, checkout totals, completion, and logout |

## Project structure

```text
.
├── .github/workflows/playwright.yml   # CI workflow
├── docs/demo-guide.md                 # 5–8 minute presentation guide
├── tests/
│   ├── functional/
│   │   ├── login.spec.ts
│   │   ├── inventory-cart.spec.ts
│   │   └── checkout-logout.spec.ts
│   └── e2e/
│       └── complete-checkout.spec.ts
├── .env.example                       # Safe local configuration template
├── playwright.config.ts               # Browser and shared test configuration
├── package.json                        # Commands and dependencies
└── package-lock.json                   # Reproducible dependency versions
```

## Prerequisites

- Node.js 24
- npm
- Git

## Installation

From the project directory:

```bash
npm ci
npx playwright install
```

Use `npx playwright install --with-deps` on Linux or in CI when browser system dependencies are also required.

## Local environment setup

Copy the tracked template to a local `.env` file:

```powershell
Copy-Item .env.example .env
```

On macOS or Linux:

```bash
cp .env.example .env
```

Set the local values for `BASE_URL`, `TEST_USER_USERNAME`, `TEST_USER_PASSWORD`, and `LOCKED_USER_USERNAME`. The test suite validates required variable names without printing their values.

Never commit `.env`. The repository tracks only `.env.example`, which contains safe placeholders.

## Commands

| Command | Purpose |
| --- | --- |
| `npm test` | Run the complete suite across all configured browser projects |
| `npm run test:chromium` | Run the complete suite in Chromium |
| `npm run test:functional` | Run the eight functional scenarios in Chromium |
| `npm run test:e2e` | Run the primary end-to-end journey in Chromium |
| `npm run test:headed` | Run the primary E2E journey in a visible Chromium window |
| `npm run test:ui` | Open Playwright UI Mode for interactive execution and debugging |
| `npm run report` | Open the most recently generated Playwright HTML report |

## Assertions and reliability practices

- Tests use user-facing roles, labels, placeholders, visible text, and Swag Labs `data-test` attributes.
- Product operations are scoped to their inventory, cart, or checkout item containers.
- Web-first assertions automatically wait for expected UI state.
- URL assertions compare exact pathnames so login, inventory, cart, and checkout routes cannot be confused.
- Each test receives a fresh browser context and authenticates independently.
- Sorting checks compare every displayed numeric price with an independently sorted copy.
- Checkout calculations verify item total, 8% tax, and final total numerically and textually.
- Fixed sleeps, forced clicks, XPath, and brittle positional selectors are avoided.

## Reports, traces, and failure evidence

The suite uses Playwright's HTML reporter. After a run, open the report with:

```bash
npm run report
```

The configuration captures a trace on the first retry. CI enables retries, so intermittent failures can be investigated through the trace timeline, network activity, DOM snapshots, and action history. Playwright also records available failure context under `test-results`, while the HTML report is written to `playwright-report`.

Treat reports and traces as potentially sensitive because browser state can contain entered test data. Do not publish artifacts from real production environments without appropriate access controls and retention rules.

## CI/CD

The GitHub Actions workflow runs on pushes and pull requests to `main`, and it supports manual execution. It uses Ubuntu and Node.js 24, installs locked npm dependencies and Playwright browser dependencies, then runs the complete suite.

The Playwright HTML report is uploaded even when tests fail and retained for 14 days, giving reviewers a consistent diagnostic artifact without keeping training evidence indefinitely.

## Security

`.env` is intentionally excluded from source control. The workflow uses only Swag Labs' publicly supplied training credentials. Any real credentials or production secrets must be stored in GitHub Secrets and referenced through the workflow environment rather than committed to YAML, tests, documentation, or reports.

## Project scope

This portfolio project targets [https://www.saucedemo.com](https://www.saucedemo.com) and demonstrates authentication, inventory, cart, checkout, order-completion, logout, regression, reporting, and CI workflows.
