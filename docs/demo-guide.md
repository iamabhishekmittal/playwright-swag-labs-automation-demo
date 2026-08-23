# Swag Labs Automation Demo Guide

This guide supports a focused 5–8 minute portfolio demonstration.

## 1. Opening — 30–45 seconds

“This project demonstrates a maintainable Playwright TypeScript test suite for Swag Labs. It covers focused authentication, inventory, cart, checkout, and session behaviours, then brings them together in a primary end-to-end customer journey. The same suite runs locally and in GitHub Actions.”

## 2. Project structure — 45–60 seconds

Show these areas in the editor:

- `playwright.config.ts`: shared base URL, `data-test` support, browser projects, retries, reporter, and tracing.
- `tests/functional`: eight independently executable scenarios grouped by feature.
- `tests/e2e/complete-checkout.spec.ts`: the complete customer journey.
- `.github/workflows/playwright.yml`: automated CI execution and report upload.
- `.env.example`: safe documentation of required local configuration.

Emphasise that `.env` remains local and is never committed.

## 3. Functional, E2E, and regression testing — 45–60 seconds

- **Functional tests** isolate one behaviour, such as locked-user login, price sorting, cart removal, or checkout validation. Failures are focused and quick to diagnose.
- **End-to-end testing** validates that the major components work together across the complete customer journey, from authentication through order completion and logout.
- **Regression testing** runs all nine scenarios after changes to detect unintended effects across established behaviour.

## 4. Key code sections — 90–120 seconds

Show two or three of these sections:

1. **Credential validation and login helper** in `complete-checkout.spec.ts`: environment variables are validated by name, and values are never logged.
2. **Container-scoped product interactions** in `inventory-cart.spec.ts`: each action starts from an inventory or cart item identified by its visible product name.
3. **Structured E2E reporting and checkout calculations** in `complete-checkout.spec.ts`: `test.step()` creates readable stages, while item total, 8% tax, and final total are verified numerically and against displayed labels.

Call out exact pathname checks and Playwright's web-first assertions as safeguards against false positives.

## 5. Visible E2E execution — 60–90 seconds

Run this exact command from the project directory:

```bash
npm run test:headed
```

Ask the audience to watch for:

- Successful standard-user login and the Products view.
- Low-to-high product sorting.
- Two products added, followed by one removal and the cart badge changing from 2 to 1.
- Customer information entry and checkout overview.
- Item total `$7.99`, tax `$0.64`, and final total `$8.63`.
- The “Thank you for your order!” confirmation.
- Logout returning the browser to the login page.

## 6. HTML report — 30–45 seconds

After execution, run:

```bash
npm run report
```

Show the test result, the eight named E2E steps, durations, and available failure details. Explain that CI traces are captured on the first retry to support deeper investigation of intermittent failures.

## 7. CI/CD — 30–45 seconds

Open `.github/workflows/playwright.yml` and explain that GitHub Actions:

- Runs for pushes and pull requests to `main`, or manually.
- Uses Node.js 24 on `ubuntu-latest`.
- Performs a reproducible `npm ci` installation.
- Installs Playwright browsers and operating-system dependencies.
- Runs the complete suite.
- Uploads the HTML report even if tests fail and retains it for 14 days.

The checked-in workflow values are public Swag Labs training credentials. Real credentials belong in GitHub Secrets.

## 8. Closing — 20–30 seconds

“This independent portfolio project demonstrates fast functional feedback, confidence in the complete customer journey, clear failure diagnostics, and repeatable CI quality gates. Its structure is small enough to understand quickly and disciplined enough to extend safely.”

## Likely questions

**Why use both visible text and `data-test` attributes?**

Visible text validates the user experience, while stable `data-test` attributes provide precise scoping for repeated UI components.

**Why keep functional and E2E tests separate?**

Functional tests identify localised defects quickly; the E2E test proves the complete business journey works across pages.

**How are flaky tests avoided?**

The suite uses web-first assertions, automatic locator waiting, isolated contexts, exact routes, and no fixed sleeps or forced clicks.

**Can this run in other browsers?**

Yes. Chromium, Firefox, and WebKit are configured; the demonstration scripts focus on Chromium for speed and consistency.

**How should real credentials be handled?**

Keep them out of the repository, store them in GitHub Secrets, and limit report and trace access because artifacts may contain browser state.

**What is the next practical extension?**

Add reusable fixtures or page objects when the suite grows, then introduce cross-browser and scheduled regression jobs according to project risk.
