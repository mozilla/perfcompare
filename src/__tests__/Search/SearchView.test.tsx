import userEvent from '@testing-library/user-event';
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import { repoMap } from '../../common/constants';
import { loader } from '../../components/Search/loader';
import SearchView from '../../components/Search/SearchView';
import { Strings } from '../../resources/Strings';
import getTestData from '../utils/fixtures';
import {
  screen,
  act,
  render,
  renderWithRouter,
  waitFor,
  within,
  FetchMockSandbox,
} from '../utils/test-utils';

const baseTitle = Strings.components.searchDefault.base.title;

function setupTestData() {
  const { testData } = getTestData();
  (global.fetch as FetchMockSandbox)
    .get(
      'begin:https://treeherder.mozilla.org/api/project/try/push/?author_contains=',
      (url) => {
        const author = new URL(url).searchParams.get('author_contains');
        return { results: testData.filter((item) => item.author === author) };
      },
    )
    .get(
      'glob:https://treeherder.mozilla.org/api/project/*/push/?revision=*',
      (urlAsString) => {
        const url = new URL(urlAsString);
        const revision = url.searchParams.get('revision');
        const repository = url.pathname.split('/')[3];
        return {
          results: testData.filter(
            (item) =>
              item.revision === revision &&
              repoMap[item.repository_id] === repository,
          ),
        };
      },
    )
    .get('glob:https://treeherder.mozilla.org/api/project/*/push/*', {
      results: testData,
    });
}

async function expandOverTimeComponent() {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  const testExpandedID = 'time-state';
  const headerContent = screen.getByTestId(testExpandedID);
  await user.click(headerContent);
  expect(screen.getByTestId(testExpandedID)).toHaveClass(
    'compare-card-container--expanded',
  );
}

async function expandWithBaseComponent() {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  const testExpandedID = 'base-state';
  const headerContent = screen.getByTestId(testExpandedID);
  await user.click(headerContent);
  expect(screen.getByTestId(testExpandedID)).toHaveClass(
    'compare-card-container--expanded',
  );
}

async function getOverTimeForm() {
  const formName = 'Compare over time form';
  const formElement = await screen.findByRole('form', {
    name: formName,
  });
  return formElement;
}

async function getWithBaseForm() {
  const formName = 'Compare with base form';
  const formElement = await screen.findByRole('form', {
    name: formName,
  });
  return formElement;
}

async function renderComponent(
  options?: Partial<{ route: string; search: string }>,
) {
  setupTestData();
  renderWithRouter(<SearchView title={Strings.metaData.pageTitle.search} />, {
    loader,
    ...options,
  });
  const title = 'Compare with a base';
  const compTitle = await screen.findByRole('heading', { name: title });
  expect(compTitle).toBeInTheDocument();
}

describe('Search View', () => {
  it('renders correctly when there are no results', async () => {
    await renderComponent();

    // We have to account for the dropdown position
    // Shift focus to base search

    expect(document.body).toMatchSnapshot();
  });

  it('renders skip to search link correctly', async () => {
    await renderComponent();
    expect(
      screen.getByRole('link', { name: /skip to search/i }),
    ).toBeInTheDocument();
  });

  it('renders a skip link that sends the focus directly to search container', async () => {
    await renderComponent();

    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.tab();
    await user.keyboard('{Enter}');
    expect(screen.getByTestId('search-section')).toHaveFocus();
  });
});

describe('Search Container', () => {
  it('renders compare with base', async () => {
    await renderComponent();

    const compTitle = await screen.findByRole('heading', {
      name: baseTitle,
    });

    const baseInput = screen.getAllByPlaceholderText(
      'Search by revision ID or author email',
    )[0];
    const repoDropdown = screen.getByRole('combobox', { name: 'Base' });

    expect(compTitle).toBeInTheDocument();
    expect(baseInput).toBeInTheDocument();
    expect(repoDropdown).toBeInTheDocument();
  });
});

describe('Base and OverTime Search', () => {
  it('renders repository dropdown in closed condition in both Base and OverTime components', async () => {
    await renderComponent();
    // 'try' is selected by default and dropdown is not visible
    expect(screen.getAllByText(/try/i)[0]).toBeInTheDocument();
    expect(screen.queryByText(/mozilla-central/i)).not.toBeInTheDocument();

    //test the overtime component
    await expandOverTimeComponent();
    expect(screen.getAllByText(/try/i)[2]).toBeInTheDocument();
    expect(screen.queryByText(/autoland/i)).not.toBeInTheDocument();

    await expandWithBaseComponent();

    // Search input appears
    expect(
      screen.getAllByPlaceholderText(
        /Search by revision ID or author email/i,
      )[0],
    ).toBeInTheDocument();

    await expandOverTimeComponent();
    expect(
      screen.getAllByPlaceholderText(
        /Search by revision ID or author email/i,
      )[1],
    ).toBeInTheDocument();

    // No list items should appear
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  it('renders framework dropdown in closed condition', async () => {
    await renderComponent();
    // 'talos' is selected by default and dropdown is not visible
    expect(screen.getAllByText(/talos/i)[0]).toBeInTheDocument();
    expect(screen.queryByText(/build_metrics/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/awsy/i)).not.toBeInTheDocument();
  });

  it('should hide search results when clicking outside of search input', async () => {
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await renderComponent();

    // Click inside the input box to show search results.
    const searchInput = screen.getAllByRole('textbox')[0];
    await user.click(searchInput);

    const comment = await screen.findAllByText("you've got no arms left!");
    expect(comment[0]).toBeInTheDocument();

    // Click outside the input box to hide search results.
    const label = screen.getByLabelText('Base');
    await user.click(label);
    expect(comment[0]).not.toBeInTheDocument();
  });

  it('Should hide the search results when Escape key is pressed', async () => {
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await renderComponent();

    // Click inside the input box to show search results.

    const searchInput = screen.getAllByRole('textbox')[0];
    await user.click(searchInput);

    const comment = await screen.findAllByText("you've got no arms left!");
    expect(comment[0]).toBeInTheDocument();

    // Press Escape key to hide search results.

    await user.keyboard('{Escape}');
    expect(comment[0]).not.toBeInTheDocument();
  });

  it('Should not call fetch if search value is not a hash or email', async () => {
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await renderComponent();

    const searchInput = screen.getAllByRole('textbox')[0];

    // We're running fake timers after each user action, because the input
    // normally waits 500ms before doing requests. Because we want to test the
    // requests, we have to run the timers to properly assess the result.
    // They're all wrapped in "act" because they might also trigger state
    // changes and rerenders.
    await user.type(searchInput, 'co');
    act(() => void jest.runAllTimers());
    await user.clear(searchInput);
    act(() => void jest.runAllTimers());

    await user.type(searchInput, 'sp');
    act(() => void jest.runAllTimers());

    expect(
      await screen.findByText(
        'The search input must be at least three characters.',
      ),
    ).toBeInTheDocument();

    // fetch is called 6 times:
    // - 3 times on initial load: one for each input, that is 2 in "compare with
    //   base", 1 in "compare over time"
    // - 1 time from the user interaction: 1 time for each "clear", because the
    //   other user interactons are invalid and therefore don't trigger any
    //   fetches (this is the goal for this test).
    expect(global.fetch).toHaveBeenCalledTimes(4);
  });

  it('Should debounce user interaction', async () => {
    // Contrary to the previous test, the timers are not run so that we can test
    // the debounce behavior.

    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await renderComponent();

    const searchInput = screen.getAllByRole('textbox')[0];
    await user.click(searchInput);

    // Wait until the dropdown appears as the result of the focus.
    await screen.findByText('She turned me into a newt!');

    await user.type(searchInput, 'jo');
    // No error appears while the user type.
    expect(
      screen.queryByText('The search input must be at least three characters.'),
    ).not.toBeInTheDocument();

    // But this appears after a while.
    expect(
      await screen.findByText(
        'The search input must be at least three characters.',
      ),
    ).toBeInTheDocument();
    await user.type(searchInput, 'hncleese');
    await user.type(searchInput, '@python.co');
    await user.type(searchInput, 'm');

    // The only result is this one. All other results should not appear.
    expect(
      await screen.findByText("you've got no arms left!"),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByText('She turned me into a newt!'),
      ).not.toBeInTheDocument(),
    );

    // Fetch was called 4 times:
    // - 3 times on initial load
    // - once for coconut@python.com
    // The call to coconut@python.co was debounced.
    expect(global.fetch).not.toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/try/push/?author_contains=johncleese%40python.co',
      undefined,
    );
    expect(global.fetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/try/push/?author_contains=johncleese%40python.com',
      undefined,
    );
    expect(global.fetch).toHaveBeenCalledTimes(4);
  });

  it('Should clear search results if the search value is cleared', async () => {
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await renderComponent();

    const searchInput = screen.getAllByRole('textbox')[0];
    await user.type(searchInput, 'terrygilliam@python.com');
    act(() => void jest.runAllTimers());

    expect(global.fetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/try/push/?author_contains=terrygilliam%40python.com',
      undefined,
    );

    await screen.findAllByText('What, ridden on a horse?');

    await user.clear(searchInput);

    expect(
      screen.queryByText('What, ridden on a horse?'),
    ).not.toBeInTheDocument();
  });

  it('should not hide search results when clicking search results', async () => {
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await renderComponent();

    // focus input to show results
    const searchInput = screen.getAllByRole('textbox')[0];
    await user.click(searchInput);

    await screen.findAllByText("you've got no arms left!");
    expect(
      screen.getAllByText("it's just a flesh wound")[0],
    ).toBeInTheDocument();
    await user.click(screen.getAllByText("you've got no arms left!")[0]);
    await user.click(screen.getAllByTestId('RadioButtonUncheckedIcon')[0]);

    expect(
      screen.getAllByText("you've got no arms left!")[0],
    ).toBeInTheDocument();
    expect(
      screen.getAllByText("it's just a flesh wound")[0],
    ).toBeInTheDocument();
  });

  it('should update error state with generic message if fetch error is undefined', async () => {
    (global.fetch as FetchMockSandbox).mock('*', { throws: new Error() });
    // This test will output an error to the console. Let's silence it.
    jest.spyOn(console, 'error').mockImplementation(() => {});
    await renderComponent();
    act(() => void jest.runAllTimers());

    expect(global.fetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/try/push/?hide_reviewbot_pushes=true&count=30',
      undefined,
    );
    const errorElements = await screen.findAllByText('An error has occurred');
    expect(errorElements[0]).toBeInTheDocument();
    expect(errorElements[1]).toBeInTheDocument();
    expect(console.error).toHaveBeenCalledWith(
      'Error while fetching recent revisions:',
      new Error(),
    );
    // 3 times: 1 for each input, that is 2 in compare with base, 1 in compare over time
    expect(console.error).toHaveBeenCalledTimes(3);
  });

  it('should have compare button and once clicked should redirect to results page with the right query params', async () => {
    // In this test, we need to define both / and /compare-results routes, so
    // we'll do that directly without renderComponent.

    setupTestData();
    const router = createBrowserRouter([
      {
        path: '/',
        element: <SearchView title={Strings.metaData.pageTitle.search} />,
        loader,
      },
      { path: '/compare-results', element: <div /> },
    ]);

    render(<RouterProvider router={router} />);

    expect(window.location.pathname).toBe('/');

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    // Press the compare button -> It shouldn't work!
    const compareButton = await screen.findByRole('button', {
      name: /Compare/,
    });
    await user.click(compareButton);

    // We haven't navigated.
    expect(window.location.pathname).toBe('/');
    // And there should be an alert
    expect(
      await screen.findByText('Please select at least one base revision.'),
    ).toBeInTheDocument();

    // focus first input to show results
    const inputs = screen.getAllByRole('textbox');
    await user.click(inputs[0]);

    // Select a base rev
    let items = await screen.findAllByText("you've got no arms left!");
    await user.click(items[0]);

    // Press Escape key to hide search results.
    await user.keyboard('{Escape}');
    expect(items[0]).not.toBeInTheDocument();

    // Check that the item has been added
    await screen.findByText(/no arms left/);

    // Now focus the second input
    await user.click(inputs[1]);
    // Select a new rev
    items = await screen.findAllByText("it's just a flesh wound");
    await user.click(items[0]);

    // Press Escape key to hide search results.
    await user.keyboard('{Escape}');

    // Check that the item has been added
    await screen.findByText(/flesh wound/);

    // Press the compare button
    await user.click(compareButton);

    expect(window.location.pathname).toBe('/compare-results');
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.sort();
    expect(searchParams.toString()).toBe(
      'baseRepo=try&baseRev=coconut&framework=1&newRepo=mozilla-central&newRev=spam',
    );
  });
});

describe('With search parameters', () => {
  it('both search components are populated as expected when revision and repository are specified', async () => {
    await renderComponent({ search: '?newRev=spamspam&newRepo=try' });
    const withBaseForm = await getWithBaseForm();
    expect(
      within(withBaseForm).getByRole('link', { name: /spamspam/ }),
    ).toBeInTheDocument();
    expect(
      within(withBaseForm).getByRole('combobox', { name: 'Base' }),
    ).toHaveTextContent('try');
    expect(
      within(withBaseForm).getByRole('combobox', { name: 'Revisions' }),
    ).toHaveTextContent('try');
    expect(
      within(withBaseForm).getByRole('combobox', { name: /Framework/ }),
    ).toHaveTextContent('talos');
    expect(withBaseForm).toMatchSnapshot('with base form');

    await expandOverTimeComponent();
    const overtimeForm = await getOverTimeForm();
    expect(
      within(overtimeForm).getByRole('link', { name: /spamspam/ }),
    ).toBeInTheDocument();
    expect(
      within(overtimeForm).getByRole('combobox', { name: /Base repository/ }),
    ).toHaveTextContent('try');
    expect(
      within(overtimeForm).getByRole('combobox', { name: 'Revisions' }),
    ).toHaveTextContent('try');
    expect(
      within(overtimeForm).getByRole('combobox', { name: /Framework/ }),
    ).toHaveTextContent('talos');
    expect(overtimeForm).toMatchSnapshot('over time form');
  });

  it('both search components are populated as expected when revision, repository and framework are specified', async () => {
    await renderComponent({
      search:
        '?newRev=spamspamspamandeggs&newRepo=autoland&frameworkName=browsertime',
    });
    const withBaseForm = await getWithBaseForm();
    expect(
      within(withBaseForm).getByRole('link', { name: /spamspamspam/ }), // Note that the revision is truncated
    ).toBeInTheDocument();
    expect(
      within(withBaseForm).getByRole('combobox', { name: 'Base' }),
    ).toHaveTextContent('autoland');
    expect(
      within(withBaseForm).getByRole('combobox', { name: 'Revisions' }),
    ).toHaveTextContent('autoland');
    expect(
      within(withBaseForm).getByRole('combobox', { name: /Framework/ }),
    ).toHaveTextContent('browsertime');
    expect(withBaseForm).toMatchSnapshot('with base form');

    await expandOverTimeComponent();
    const overtimeForm = await getOverTimeForm();
    expect(
      within(overtimeForm).getByRole('link', { name: /spamspamspam/ }),
    ).toBeInTheDocument();
    expect(
      within(overtimeForm).getByRole('combobox', { name: /Base repository/ }),
    ).toHaveTextContent('autoland');
    expect(
      within(overtimeForm).getByRole('combobox', { name: 'Revisions' }),
    ).toHaveTextContent('autoland');
    expect(
      within(overtimeForm).getByRole('combobox', { name: /Framework/ }),
    ).toHaveTextContent('browsertime');
    expect(overtimeForm).toMatchSnapshot('over time form');
  });

  it('displays the default values if some values are bogus', async () => {
    jest.spyOn(console, 'warn').mockImplementation();
    await renderComponent({
      search: '?newRev=spamspamspamandeggs&newRepo=foo',
    });

    expect(console.warn).toHaveBeenCalledWith(
      "The repository foo wasn't found in our list.",
    );
    const withBaseForm = await getWithBaseForm();
    expect(withBaseForm).toMatchSnapshot('with base form');

    await expandOverTimeComponent();
    const overtimeForm = await getOverTimeForm();
    expect(overtimeForm).toMatchSnapshot('over time form');
  });

  it('displays the default value for framework if the framework value is bogus', async () => {
    jest.spyOn(console, 'warn').mockImplementation();

    await renderComponent({
      search: '?newRev=spamspam&newRepo=try&frameworkName=foo',
    });
    expect(console.warn).toHaveBeenCalledWith(
      "The framework entry for foo wasn't found, defaulting to talos.",
    );

    const withBaseForm = await getWithBaseForm();
    expect(
      within(withBaseForm).getByRole('link', { name: /spamspam/ }),
    ).toBeInTheDocument();
    expect(
      within(withBaseForm).getByRole('combobox', { name: 'Base' }),
    ).toHaveTextContent('try');
    expect(
      within(withBaseForm).getByRole('combobox', { name: 'Revisions' }),
    ).toHaveTextContent('try');
    expect(
      within(withBaseForm).getByRole('combobox', { name: /Framework/ }),
    ).toHaveTextContent('talos');
    expect(withBaseForm).toMatchSnapshot('with base form');

    await expandOverTimeComponent();
    const overtimeForm = await getOverTimeForm();
    expect(
      within(overtimeForm).getByRole('link', { name: /spamspam/ }),
    ).toBeInTheDocument();
    expect(
      within(overtimeForm).getByRole('combobox', { name: /Base repository/ }),
    ).toHaveTextContent('try');
    expect(
      within(overtimeForm).getByRole('combobox', { name: 'Revisions' }),
    ).toHaveTextContent('try');
    expect(
      within(overtimeForm).getByRole('combobox', { name: /Framework/ }),
    ).toHaveTextContent('talos');
    expect(overtimeForm).toMatchSnapshot('over time form');
  });
});
