# Swag Labs Automation Demo Guide

This guide supports a focused 5–8 minute technical demonstration of the repository.

## 1. Introduce the project — 30–45 seconds

Suggested opening:

> This is an independent personal portfolio project demonstrating Playwright and TypeScript browser automation against SauceDemo. SauceDemo is a third-party public training application that I do not own or maintain. The suite contains eight focused functional scenarios and one complete checkout journey.

Explain that all nine scenarios run across Chromium, Firefox and WebKit, producing 27 executions.

## 2. Show the structure — 45–60 seconds

Open these areas:

- `playwright.config.ts`: environment-based URL, `data-test` support, browser projects, CI retries, HTML reporting and tracing.
- `tests/functional`: eight scenarios grouped by feature.
- `tests/e2e/complete-checkout.spec.ts`: the complete customer journey.
- `.github/workflows/playwright.yml`: CI execution and report upload.
- `.env.example`: placeholders for required local configuration.

Note that `.env`, reports and test results remain local and are not tracked.

## 3. Explain the test strategy — 45–60 seconds

- Functional tests isolate authentication, sorting, cart, checkout-validation and session behaviours.
- The E2E scenario validates the connected journey from login through order completion and logout.
- Every test receives a fresh browser context and authenticates independently.
- Running the suite after changes provides repeatable regression feedback.

## 4. Highlight implementation decisions — 90–120 seconds

Choose two or three examples:

1. **Container-scoped interactions** in `inventory-cart.spec.ts`: actions begin from the item containing the exact product name.
2. **Numeric sorting validation** in `inventory-cart.spec.ts`: all displayed prices are converted to numbers and compared with an independently sorted copy.
3. **Checkout calculations** in `complete-checkout.spec.ts`: subtotal, 8% tax with rounding and final total are independently calculated.
4. **Readable E2E reporting** in `complete-checkout.spec.ts`: eight named `test.step()` stages make the report easy to follow.
5. **Environment validation**: required variable names are reported when missing, but values are never logged.

Point out the semantic and test-ID locators, exact pathname checks, web-first assertions, and absence of fixed sleeps or forced clicks.

## 5. Run the E2E demonstration — 60–90 seconds

Run:

```bash
npm run test:headed
```

Ask the audience to watch for:

- Standard-user login.
- Low-to-high product sorting.
- Two additions followed by one removal.
- Synthetic customer information entry.
- Item total `$7.99`, tax `$0.64` and final total `$8.63`.
- Order confirmation.
- Logout returning to the login page.

## 6. Show debugging and reporting — 45–60 seconds

Open the latest HTML report:

```bash
npm run report
```

Show the named E2E steps, duration and available failure details.

For interactive exploration, use UI Mode:

```bash
npm run test:ui
```

For the Playwright Inspector:

```bash
npx playwright test tests/e2e/complete-checkout.spec.ts --project=chromium --debug
```

Explain that CI captures a trace on the first retry for investigating intermittent failures.

## 7. Explain GitHub Actions CI — 30–45 seconds

The workflow:

- Runs on pushes and pull requests to `main`, or manually.
- Uses Node.js 24 on `ubuntu-latest`.
- Installs locked npm dependencies and Playwright browser dependencies.
- Runs all 27 cross-browser executions through `npm test`.
- Uploads the HTML report even after failures and retains it for 14 days.

This is continuous integration only. It does not deploy, release or publish an application. The checked-in workflow values are public SauceDemo training credentials; real credentials belong in GitHub Secrets.

## 8. Close — 20–30 seconds

Suggested closing:

> The repository demonstrates focused functional coverage, a readable end-to-end journey, cross-browser execution and practical failure diagnostics. The implementation is intentionally small and can adopt fixtures or Page Objects later if its size makes that structure worthwhile.

## Likely questions

### Why combine visible text and `data-test` attributes?

Visible text validates user-observable content. Stable `data-test` attributes provide precise scoping for repeated interface components.

### Why separate functional and E2E tests?

Focused scenarios make failures easier to locate, while the E2E scenario checks that the main journey works across pages.

### How does the suite reduce flaky behaviour?

It uses Playwright's automatic waiting, web-first assertions, isolated contexts, exact route checks and no fixed sleeps or forced clicks.

### Does it run in multiple browsers?

Yes. Chromium, Firefox and WebKit are configured locally and in the complete CI suite.

### How should real credentials be handled?

Keep them out of the repository, store them in GitHub Secrets, and review reports and traces before sharing because artifacts may contain browser state.

### What would you improve next?

Only as the suite grows: extract genuinely repeated setup into fixtures or Page Objects, and add other test layers when project requirements justify them.
