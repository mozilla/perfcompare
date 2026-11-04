import { defineConfig, devices } from '@playwright/test';

// These end-to-end tests run against the production build (`npm run build`),
// served by e2e/serve-build.mjs. Treeherder is always mocked, see
// e2e/fixtures.ts, so the tests are deterministic and need no network.
//
// They exist mainly to validate dependency-update PRs (dependabot, depfu) in a
// real browser: see .github/agent/README.md.

const port = Number(process.env.E2E_PORT ?? 4173);
const baseURL = `http://127.0.0.1:${port}`;
const buildDir = process.env.E2E_BUILD_DIR ?? 'build';

// Optionally use an already installed browser instead of the one downloaded by
// `npx playwright install firefox`.
const executablePath = process.env.PLAYWRIGHT_FIREFOX_EXECUTABLE;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  // One retry in CI: a test that only passes on retry is reported as "flaky"
  // in the JSON report, so it can be told apart from a real regression.
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [
        ['list'],
        ['html', { open: 'never' }],
        ['json', { outputFile: 'test-results/results.json' }],
      ]
    : 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        launchOptions: executablePath ? { executablePath } : {},
      },
    },
  ],
  webServer: {
    command: `node e2e/serve-build.mjs ${buildDir} ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});
