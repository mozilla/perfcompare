import userEvent from '@testing-library/user-event';

import { loader } from '../../components/CompareResults/loader';
import ResultsView from '../../components/CompareResults/ResultsView';
import { Strings } from '../../resources/Strings';
import getTestData from '../utils/fixtures';
import {
  renderWithRouter,
  screen,
  waitFor,
  FetchMockSandbox,
} from '../utils/test-utils';

function setUpTestData() {
  const { testData, testCompareData } = getTestData();

  // We'll generate compare results with enough differences that searching
  // through them can show different results.
  const baseCompareData = testCompareData[0];
  const compareData = [
    {
      ...baseCompareData,
      new_rev: 'spam',
      platform: 'macosx1015-64-shippable-qr',
      suite: 'a11yr',
      header_name: 'a11yr dhtml.html opt e10s fission stylo webrender',
      test: 'dhtml.html',
      option_name: 'opt',
      extra_options: 'e10s fission stylo webrender',
    },
    {
      ...baseCompareData,
      new_rev: 'swallowbird',
      platform: 'linux1804-64-shippable-qr',
      suite: 'glvideo',
      header_name:
        'glvideo Mean tick time across 100 ticks: debug e10s fission webgl',
      test: 'Mean tick time across 100 ticks:',
      option_name: 'debug',
      extra_options: 'e10s fission webgl',
    },
  ];

  (global.fetch as FetchMockSandbox)
    .get(
      'begin:https://treeherder.mozilla.org/api/perfcompare/results/',
      compareData,
    )
    .get('glob:https://treeherder.mozilla.org/api/project/*/push/*', {
      results: testData,
    })
    .get(
      'begin:https://treeherder.mozilla.org/api/project/try/push/?revision=coconut',
      {
        results: [testData[0]],
      },
    )
    .get(
      'begin:https://treeherder.mozilla.org/api/project/mozilla-central/push/?revision=spam',
      {
        results: [testData[1]],
      },
    );
}

async function setupAndRenderComponent() {
  setUpTestData();
  renderWithRouter(<ResultsView title={Strings.metaData.pageTitle.results} />, {
    route: '/compare-results/',
    search:
      '?baseRev=coconut&baseRepo=try&newRev=spam&newRepo=mozilla-central&framework=2',
    loader,
  });

  expect(await screen.findByText('a11yr')).toBeInTheDocument();
  expect(await screen.findByText('glvideo')).toBeInTheDocument();
}

describe('Search by title/test name', () => {
  it('should filter results after a timeout or immediately with enter', async () => {
    await setupAndRenderComponent();

    const form = await screen.findByRole('form', { name: /Search by title/ });
    expect(form).toMatchSnapshot();

    const searchInput = await screen.findByRole('textbox', {
      name: /Search by title/,
    });

    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.type(searchInput, 'glvideo');

    // I don't understand why waitForElementToBeRemoved doesn't work properly.
    await waitFor(() =>
      expect(screen.queryByText('a11yr')).not.toBeInTheDocument(),
    );
    expect(screen.getByText('glvideo')).toBeInTheDocument();

    await user.clear(searchInput);
    await screen.findByText('a11yr');

    // With Enter the search should happen right away.
    await user.type(searchInput, 'a11yr{Enter}');
    expect(screen.queryByText('glvideo')).not.toBeInTheDocument();
    expect(screen.getByText('a11yr')).toBeInTheDocument();
  });

  it('should filter various properties', async () => {
    await setupAndRenderComponent();

    const searchInput = await screen.findByRole('textbox', {
      name: /Search by title/,
    });

    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    // With the mock setup in this test, there are 2 results with different
    // properties. In this test we make each of the input show and disappear in
    // an alternance, by searching for the values in the different properties.
    await user.type(searchInput, 'swallowbi');
    await waitFor(() =>
      expect(screen.queryByText('spam')).not.toBeInTheDocument(),
    );
    expect(screen.getByText('swallowbird')).toBeInTheDocument();

    await user.clear(searchInput);
    await user.type(searchInput, 'opt');
    expect(await screen.findByText('spam')).toBeInTheDocument();
    expect(screen.queryByText('swallowbird')).not.toBeInTheDocument();

    await user.clear(searchInput);
    await user.type(searchInput, 'linu');
    expect(await screen.findByText('swallowbird')).toBeInTheDocument();
    expect(screen.queryByText('spam')).not.toBeInTheDocument();

    await user.clear(searchInput);
    await user.type(searchInput, 'dhtml');
    expect(await screen.findByText('spam')).toBeInTheDocument();
    expect(screen.queryByText('swallowbird')).not.toBeInTheDocument();

    await user.clear(searchInput);
    await user.type(searchInput, 'webgl');
    expect(await screen.findByText('swallowbird')).toBeInTheDocument();
    expect(screen.queryByText('spam')).not.toBeInTheDocument();

    await user.clear(searchInput);
    await user.type(searchInput, 'DhTmL');
    expect(await screen.findByText('spam')).toBeInTheDocument();
    expect(screen.queryByText('swallowbird')).not.toBeInTheDocument();

    await user.clear(searchInput);
    await user.type(searchInput, 'WEBGL');
    expect(await screen.findByText('swallowbird')).toBeInTheDocument();
    expect(screen.queryByText('spam')).not.toBeInTheDocument();

    await user.type(searchInput, 'XXX');
    expect(await screen.findByText('No results found')).toBeInTheDocument();
  });

  it('should reset the search input after clicking on the clear button', async () => {
    await setupAndRenderComponent();

    const searchInput = await screen.findByRole('textbox', {
      name: /Search by title/,
    });

    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    // With the mock setup in this test, there are 2 results with different
    // properties. In this test we make each of the input show and disappear in
    // an alternance, by searching for the values in the different properties.
    await user.type(searchInput, 'swallowbi');
    await waitFor(() =>
      expect(screen.queryByText('spam')).not.toBeInTheDocument(),
    );

    const clearButton = screen.getByRole('button', {
      name: 'Clear the search input',
    });
    await user.click(clearButton);
    expect(screen.getByText('spam')).toBeInTheDocument();
  });

  it('should update the url search params properly', async () => {
    await setupAndRenderComponent();

    const searchInput = await screen.findByRole('textbox', {
      name: /Search by title/,
    });

    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    // With the mock setup in this test, there are 2 results with different
    // properties. In this test we make each of the input show and disappear in
    // an alternance, by searching for the values in the different properties.
    await user.type(searchInput, 'glvideo');
    await waitFor(() =>
      expect(screen.queryByText('a11yr')).not.toBeInTheDocument(),
    );
    // Make sure that the search params are updated properly.
    expect(window.location.search).toContain('&search=glvideo');

    await user.clear(searchInput);
    expect(await screen.findByText('a11yr')).toBeInTheDocument();
    // Clearing the search should remove the search param.
    expect(window.location.search).not.toContain('&search');

    await user.type(searchInput, 'a11yr{Enter}');
    // With enter the update should happen instantly.
    expect(window.location.search).toContain('&search=a11yr');

    const clearButton = screen.getByRole('button', {
      name: 'Clear the search input',
    });
    await user.click(clearButton);
    // Clearing the search through button should also remove the search param.
    expect(window.location.search).not.toContain('&search');
  });
});
