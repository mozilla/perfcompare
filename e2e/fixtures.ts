import { test as base, expect } from '@playwright/test';
import type { Route } from '@playwright/test';

import getTestData from '../src/__tests__/utils/fixtures';

const TREEHERDER = 'https://treeherder.mozilla.org';

type Options = {
  // Some tests deliberately provoke an error page, which logs to the console.
  allowConsoleErrors: boolean;
};

type Fixtures = {
  // Mocks Treeherder and fails the test on console errors, uncaught page
  // errors, and requests to Treeherder endpoints that aren't mocked.
  app: void;
};

function json(route: Route, body: unknown) {
  return route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

export const test = base.extend<Options & Fixtures>({
  allowConsoleErrors: [false, { option: true }],

  app: [
    async ({ page, allowConsoleErrors }, use) => {
      const { testCompareMannWhitneyData: testCompareData, testData } =
        getTestData();
      const problems: string[] = [];

      page.on('console', (message) => {
        if (message.type() === 'error' && !allowConsoleErrors) {
          problems.push(`console.error: ${message.text()}`);
        }
      });
      page.on('pageerror', (error) => {
        problems.push(`uncaught error: ${error.message}`);
      });

      // Anything that leaves the local server and isn't explicitly mocked is
      // answered with an empty response, so that tests never depend on the
      // network. Requests to Treeherder are reported as problems below.
      await page.route(
        (url) => !['127.0.0.1', 'localhost'].includes(url.hostname),
        (route) => {
          const url = route.request().url();
          if (url.startsWith(TREEHERDER)) {
            problems.push(`unmocked Treeherder request: ${url}`);
          }
          return route.fulfill({ status: 204 });
        },
      );

      // Comparison results.
      await page.route(`${TREEHERDER}/api/perfcompare/results/**`, (route) =>
        json(route, testCompareData),
      );

      // Revision information, used to show the revisions being compared.
      await page.route(`${TREEHERDER}/api/project/*/push/**`, (route) => {
        const revision = new URL(route.request().url()).searchParams.get(
          'revision',
        );
        const match = testData.find((item) => item.revision === revision);
        return json(route, { results: [match ?? testData[0]] });
      });

      await use();

      expect(problems, 'problems seen while the page was running').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

// The fixture data uses these revisions, see src/__tests__/utils/fixtures.ts.
export const RESULTS_URL =
  '/compare-results?baseRev=coconut&baseRepo=mozilla-central&newRev=spam&newRepo=mozilla-central&framework=1';
