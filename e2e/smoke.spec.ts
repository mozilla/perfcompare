import type { Page } from '@playwright/test';

import { expect, test, RESULTS_URL } from './fixtures';

// Smoke tests covering the paths that dependency updates are most likely to
// break: the bundle booting (react, react-router, redux, MUI, emotion), data
// loading through route loaders, the virtualized results table, charts
// (echarts), theming, MUI menus and dropdowns, and date formatting (dayjs).

// Data rows of the results table (the header row has column headers, not
// cells).
function dataRows(page: Page) {
  return page
    .getByRole('table')
    .getByRole('row')
    .filter({ has: page.getByRole('cell') });
}

// The Δ Median values of the visible rows, in display order.
async function medianDeltas(page: Page) {
  const texts = await dataRows(page)
    .getByRole('cell')
    .filter({ hasText: /^[+-]?\d+(\.\d+)?%$/ })
    .allInnerTexts();
  return texts.map((text) => parseFloat(text));
}

test.describe('search page', () => {
  test('renders the search form', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle('PerfCompare - Search');
    await expect(
      page.getByRole('heading', { name: 'PerfCompare', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Compare', exact: true }).first(),
    ).toBeVisible();
  });

  test('can switch to dark mode', async ({ page }) => {
    await page.goto('/');

    const body = page.locator('body');
    const before = await body.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    );

    await page.getByLabel('Dark mode switch').click();

    await expect
      .poll(() =>
        body.evaluate((element) => getComputedStyle(element).backgroundColor),
      )
      .not.toBe(before);
  });
});

test.describe('search page dropdowns', () => {
  // A fixed clock and time zone make the dates in the time range labels,
  // formatted with dayjs, predictable.
  test.use({ timezoneId: 'UTC' });

  test('can pick another framework', async ({ page }) => {
    await page.goto('/');

    const framework = page.getByRole('combobox', { name: 'Framework' });
    await framework.first().click();
    await page.getByRole('option', { name: 'awsy' }).click();
    await page.keyboard.press('Escape');

    await expect(page.getByRole('listbox')).toBeHidden();
    await expect(framework.first()).toHaveText('awsy, talos');
  });

  test('shows and changes the time range with dates', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2025-03-10T12:00:00Z'));
    await page.goto('/');

    await page.getByRole('heading', { name: 'Compare over time' }).click();
    const timeRange = page.getByRole('combobox', { name: /^Time range/ });
    // The label and the dates are separate elements, hence the optional space.
    await expect(timeRange).toHaveText(
      /^Last day\s*\(Mar 9, 2025 - Mar 10, 2025\)$/,
    );

    await timeRange.click();
    await page
      .getByRole('option', { name: 'Last 7 days (Mar 3, 2025 - Mar 10, 2025)' })
      .click();

    await expect(timeRange).toHaveText(
      /^Last 7 days\s*\(Mar 3, 2025 - Mar 10, 2025\)$/,
    );
  });
});

test.describe('results page', () => {
  test('renders the comparison table from mocked Treeherder data', async ({
    page,
  }) => {
    await page.goto(RESULTS_URL);

    await expect(page).toHaveTitle('PerfCompare - Results');
    const table = page.getByRole('table');
    await expect(table).toBeVisible();
    await expect(table).toContainText('a11yr');
    await expect(
      page.getByTestId('expand-revision-button').first(),
    ).toBeVisible();
  });

  test('expanding a row renders the distribution chart', async ({ page }) => {
    await page.goto(RESULTS_URL);

    await page.getByTestId('expand-revision-button').first().click();

    const details = page.getByLabel('Revision Row Details').first();
    await expect(details).toBeVisible();
    // The canvas echarts (zrender) draws into, not the MUI icons next to it.
    await expect(
      details.locator('canvas[data-zr-dom-id]').first(),
    ).toBeVisible();
  });

  test('renders the bundled fake data with several revisions', async ({
    page,
  }) => {
    // `?fakedata` loads mock comparison results that are shipped inside the
    // bundle (lazy-loaded chunks), so this also covers code splitting.
    await page.goto('/compare-results?fakedata');

    await expect(page).toHaveTitle('PerfCompare - Results');
    await expect(page.getByRole('table').first()).toBeVisible();
    await expect(
      page.getByTestId('expand-revision-button').first(),
    ).toBeVisible();
  });

  test('the results page survives a reload', async ({ page }) => {
    await page.goto(RESULTS_URL);
    await expect(page.getByRole('table')).toBeVisible();

    await page.reload();

    await expect(page.getByRole('table')).toBeVisible();
  });
});

test.describe('results table controls', () => {
  test('filters rows with the search box', async ({ page }) => {
    await page.goto(RESULTS_URL);
    await expect(dataRows(page)).toHaveCount(4);

    await page
      .getByRole('searchbox', {
        name: 'Search by title, platform, revision or options',
      })
      .fill('linux');

    await expect(dataRows(page)).toHaveCount(1);
    await expect(dataRows(page)).toContainText('Linux');

    await page.getByRole('button', { name: 'Clear the search input' }).click();

    await expect(dataRows(page)).toHaveCount(4);
  });

  test('sorts by a column', async ({ page }) => {
    await page.goto(RESULTS_URL);
    await expect(dataRows(page)).toHaveCount(4);
    // The button's name changes once the column is sorted.
    const sortButton = page.getByRole('button', { name: /^Δ Median/ });

    await sortButton.click();
    await expect(
      sortButton.getByRole('img', {
        name: 'Sorted by Δ Median in descending order',
      }),
    ).toBeVisible();
    const descending = await medianDeltas(page);
    expect(descending).toEqual([...descending].sort((a, b) => b - a));

    await sortButton.click();
    await expect(
      sortButton.getByRole('img', {
        name: 'Sorted by Δ Median in ascending order',
      }),
    ).toBeVisible();
    const ascending = await medianDeltas(page);
    expect(ascending).toEqual([...ascending].sort((a, b) => a - b));
    expect(ascending).not.toEqual(descending);
  });

  test('filters by a column value from the header menu', async ({ page }) => {
    await page.goto(RESULTS_URL);
    await expect(dataRows(page)).toHaveCount(4);

    await page
      .getByRole('button', { name: /^Platform \(Click to filter values/ })
      .click();
    await page.getByRole('menuitem', { name: 'Select only “Linux”' }).click();
    await page.keyboard.press('Escape');

    await expect(dataRows(page)).toHaveCount(1);
    await expect(dataRows(page)).toContainText('Linux');
    await expect(
      page.getByRole('alert').filter({ hasText: 'rows hidden by filters' }),
    ).toContainText('3 rows hidden by filters');
  });
});

test.describe('compare over time results', () => {
  test.use({ timezoneId: 'UTC' });

  // Uses the same Treeherder endpoint as the compare results, so the fixture
  // mocks cover it. 604800 seconds is the "Last 7 days" range.
  test('renders the results for a time range', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2025-03-10T12:00:00Z'));
    await page.goto(
      '/compare-over-time-results?baseRepo=mozilla-central&newRev=spam&newRepo=mozilla-central&framework=1&selectedTimeRange=604800',
    );

    await expect(page).toHaveTitle('PerfCompare - Results');
    await expect(
      page.getByRole('heading', { name: 'Compare over time' }),
    ).toBeVisible();
    const form = page.getByRole('form', { name: 'Compare over time form' });
    await expect(form).toContainText(
      /Last 7 days\s*\(Mar 3, 2025 - Mar 10, 2025\)/,
    );
    await expect(form.getByRole('link', { name: 'spam' })).toBeVisible();
    await expect(dataRows(page)).toHaveCount(4);
    await expect(page.getByRole('table')).toContainText('a11yr');
  });
});

test.describe('navigation', () => {
  test('back and forward restore the framework selection', async ({ page }) => {
    await page.goto(RESULTS_URL);
    await expect(dataRows(page)).toHaveCount(4);
    const framework = page.getByRole('combobox', { name: 'Framework' });

    // Changing the framework updates the URL through react-router, which
    // reruns the route loader.
    await framework.click();
    await page.getByRole('option', { name: 'awsy' }).click();
    await page.keyboard.press('Escape');

    await expect(page).toHaveURL(/framework=1&framework=4/);
    await expect(framework).toHaveText('awsy, talos');
    await expect(dataRows(page).first()).toBeVisible();

    await page.goBack();
    await expect(page).not.toHaveURL(/framework=4/);
    await expect(framework).toHaveText('talos');
    await expect(dataRows(page)).toHaveCount(4);

    await page.goForward();
    await expect(page).toHaveURL(/framework=4/);
    await expect(framework).toHaveText('awsy, talos');
  });

  // The results page links to this view in a new tab, and the fixture data has
  // no rows with subtests, so the test opens it directly.
  test('the subtests view loads with its own route', async ({ page }) => {
    await page.goto(
      '/subtests-compare-results?baseRev=coconut&baseRepo=mozilla-central&newRev=spam&newRepo=mozilla-central&framework=1&baseParentSignature=1&newParentSignature=2',
    );

    await expect(page).toHaveTitle('PerfCompare - Subtests Results');
    await expect(
      page.getByRole('button', { name: /^Subtests \(Click to sort/ }),
    ).toBeVisible();
    await expect(dataRows(page).first()).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'All results' }),
    ).toHaveAttribute('href', /^\/compare-results\?/);
  });
});

test.describe('error handling', () => {
  test.use({ allowConsoleErrors: true });

  test('shows the error page for invalid parameters', async ({ page }) => {
    await page.goto('/compare-results');

    await expect(
      page.getByText('The parameter baseRev is missing.'),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /link to home/i }),
    ).toBeVisible();
  });
});
