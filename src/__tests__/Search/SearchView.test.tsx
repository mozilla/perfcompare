import userEvent from '@testing-library/user-event';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import SearchView from '../../components/Search/SearchView';
import { Strings } from '../../resources/Strings';
import getTestData from '../utils/fixtures';
import {
  screen,
  act,
  render,
  renderWithRouter,
  FetchMockSandbox,
} from '../utils/test-utils';

const baseTitle = Strings.components.searchDefault.base.title;

function setupTestData() {
  const { testData } = getTestData();
  (global.fetch as FetchMockSandbox).get(
    'begin:https://treeherder.mozilla.org/api/project/try/push/',
    {
      results: testData,
    },
  );
}

async function expandOverTimeComponent() {
  const user = userEvent.setup({ delay: null });
  const testExpandedID = 'time-state';
  const headerContent = screen.getByTestId(testExpandedID);

  await user.click(headerContent);
}

function renderComponent() {
  setupTestData();
  return renderWithRouter(
    <SearchView title={Strings.metaData.pageTitle.search} />,
  );
}

describe('Search View', () => {
  it('renders correctly when there are no results', async () => {
    renderComponent();

    // We have to account for the dropdown position
    // Shift focus to base search

    expect(document.body).toMatchSnapshot();
  });

  it('renders skip to search link correctly', async () => {
    renderComponent();
    expect(
      screen.getByRole('link', { name: /skip to search/i }),
    ).toBeInTheDocument();
  });

  it('renders a skip link that sends the focus directly to search container', async () => {
    renderComponent();

    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });
    await user.tab();
    await user.keyboard('{Enter}');
    expect(screen.getByTestId('search-section')).toHaveFocus();
  });
});

describe('Search Container', () => {
  it('renders compare with base', async () => {
    renderComponent();

    const compTitle = await screen.findByRole('heading', {
      name: baseTitle,
    });

    const baseInput = screen.getByPlaceholderText(
      'Search base by ID number or author email',
    );
    const repoDropdown = screen.getByRole('button', { name: 'Base' });

    expect(compTitle).toBeInTheDocument();
    expect(baseInput).toBeInTheDocument();
    expect(repoDropdown).toBeInTheDocument();
  });
});

describe('Base and OverTime Search', () => {
  it('renders repository dropdown in closed condition in both Base and OverTime components', async () => {
    renderComponent();
    await expandOverTimeComponent();
    // 'try' is selected by default and dropdown is not visible
    expect(screen.getAllByText(/try/i)[0]).toBeInTheDocument();
    //test the overtime component
    expect(screen.getAllByText(/try/i)[2]).toBeInTheDocument();

    expect(screen.queryByText(/autoland/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/mozilla-central/i)).not.toBeInTheDocument();

    // Search input appears
    expect(
      screen.getByPlaceholderText(/Search base by ID number or author email/i),
    ).toBeInTheDocument();

    // No list items should appear
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  it('renders framework dropdown in closed condition', async () => {
    renderComponent();
    // 'talos' is selected by default and dropdown is not visible
    expect(screen.getAllByText(/talos/i)[0]).toBeInTheDocument();
    expect(screen.queryByText(/build_metrics/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/awsy/i)).not.toBeInTheDocument();
  });

  it('should hide search results when clicking outside of search input', async () => {
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });
    renderComponent();

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
    const user = userEvent.setup({ delay: null });
    renderComponent();

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
    const user = userEvent.setup({ delay: null });
    renderComponent();

    const searchInput = screen.getAllByRole('textbox')[0];

    // We're running fake timers after each user action, because the input
    // normally waits 500ms before doing requests. Because we want to test the
    // requests, we have to run the timers to properly assess the result.
    // They're all wrapped in "act" because they might also trigger state
    // changes and rerenders.
    await user.type(searchInput, 'coconut');
    act(() => void jest.runAllTimers());
    await user.clear(searchInput);
    act(() => void jest.runAllTimers());

    await user.type(searchInput, 'spam@eggs');
    act(() => void jest.runAllTimers());
    await user.clear(searchInput);
    act(() => void jest.runAllTimers());

    await user.type(searchInput, 'spamspamspamand@eggs.');
    act(() => void jest.runAllTimers());
    await user.clear(searchInput);
    act(() => void jest.runAllTimers());

    await user.type(searchInput, 'iamalmostlongenoughtobeahashbutnotquite');
    act(() => void jest.runAllTimers());

    expect(
      await screen.findByText(
        'Search must be a 12- or 40-character hash, or email address',
      ),
    ).toBeInTheDocument();

    // fetch is called 6 times:
    // - 3 times on initial load: one for each input, that is 2 in "compare with
    //   base", 1 in "compare over time"
    // - 3 times from the user interaction: 1 time for each "clear"
    expect(global.fetch).toHaveBeenCalledTimes(6);
  });

  it('Should clear search results if the search value is cleared', async () => {
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });
    renderComponent();

    const searchInput = screen.getAllByRole('textbox')[0];
    await user.type(searchInput, 'terryjones@python.com');
    act(() => void jest.runAllTimers());

    expect(global.fetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/try/push/?author=terryjones%40python.com',
      undefined,
    );

    await screen.findAllByText("you've got no arms left!");

    await user.clear(searchInput);

    expect(
      screen.queryByText("you've got no arms left!"),
    ).not.toBeInTheDocument();
  });

  it('should not hide search results when clicking search results', async () => {
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });
    renderComponent();

    // focus input to show results
    const searchInput = screen.getAllByRole('textbox')[0];
    await user.click(searchInput);

    await screen.findAllByText("you've got no arms left!");
    expect(
      screen.getAllByText("it's just a flesh wound")[0],
    ).toBeInTheDocument();
    await user.click(screen.getAllByText("you've got no arms left!")[0]);
    await user.click(screen.getAllByTestId('CheckBoxOutlineBlankIcon')[0]);

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
    renderComponent();
    act(() => void jest.runAllTimers());

    expect(global.fetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/try/push/?hide_reviewbot_pushes=true',
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
      },
      { path: '/compare-results', element: <div /> },
    ]);

    render(<RouterProvider router={router} />);

    expect(window.location.pathname).toEqual('/');

    const user = userEvent.setup({ delay: null });

    // Press the compare button -> It shouldn't work!
    const compareButton = await screen.findByRole('button', {
      name: /Compare with a base/,
    });
    await user.click(compareButton);

    // We haven't navigated.
    expect(window.location.pathname).toEqual('/');
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

    expect(window.location.pathname).toEqual('/compare-results');
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.sort();
    expect(searchParams.toString()).toEqual(
      'baseRepo=try&baseRev=coconut&framework=1&newRepo=mozilla-central&newRev=spam',
    );
  });
});
