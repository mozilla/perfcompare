import userEvent from '@testing-library/user-event';

import { loader } from '../../components/Search/loader';
import SearchView from '../../components/Search/SearchView';
import { Strings } from '../../resources/Strings';
import getTestData from '../utils/fixtures';
import {
  screen,
  renderWithRouter,
  act,
  FetchMockSandbox,
} from '../utils/test-utils';

async function renderSearchViewComponent() {
  renderWithRouter(<SearchView title={Strings.metaData.pageTitle.search} />, {
    loader,
  });
  const title = 'Compare with a base';
  const compTitle = await screen.findByRole('heading', { name: title });
  expect(compTitle).toBeInTheDocument();
}

describe('Search View/fetchRevisionByID', () => {
  it('should fetch revisions by ID if searchValue is a 12 or 40 character hash', async () => {
    const { testData } = getTestData();

    (global.fetch as FetchMockSandbox).get(
      'glob:https://treeherder.mozilla.org/api/project/*/push/*',
      {
        results: testData,
      },
    );

    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    await renderSearchViewComponent();

    const searchInput = screen.getAllByRole('textbox')[0];
    await user.type(searchInput, 'abcdef123456');
    act(() => void jest.runAllTimers());
    expect(global.fetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/try/push/?revision=abcdef123456',
      undefined,
    );
    expect(
      await screen.findByText("you've got no arms left!"),
    ).toBeInTheDocument();

    await user.clear(searchInput);
    expect(
      screen.queryByText("you've got no arms left!"),
    ).not.toBeInTheDocument();

    await user.type(searchInput, 'abcdef1234567890abcdef1234567890abcdef12');
    act(() => void jest.runAllTimers());

    expect(global.fetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/try/push/?revision=abcdef1234567890abcdef1234567890abcdef12',
      undefined,
    );
    expect(
      await screen.findByText("you've got no arms left!"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText('What, ridden on a horse?'),
    ).toBeInTheDocument();
  });

  it('should reject fetchRevisionByID if fetch returns no results', async () => {
    (global.fetch as FetchMockSandbox).get(
      'glob:https://treeherder.mozilla.org/api/project/*/push/*',
      (url) => ({
        results: url.includes('?revision') ? [] : getTestData().testData,
      }),
    );

    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    await renderSearchViewComponent();

    const searchInput = screen.getAllByRole('textbox')[0];
    await user.type(searchInput, 'abcdef1234567890abcdef1234567890abcdef12');
    act(() => void jest.runAllTimers());

    expect(global.fetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/try/push/?revision=abcdef1234567890abcdef1234567890abcdef12',
      undefined,
    );

    expect(await screen.findByText('No results found')).toBeInTheDocument();
    expect(searchInput).toBeInvalid();
  });

  it('should update error state if fetchRevisionByID returns an error', async () => {
    const errorMessage = 'Connection error';
    (global.fetch as FetchMockSandbox).get(
      'glob:https://treeherder.mozilla.org/api/project/*/push/*',
      (url) =>
        url.includes('?revision')
          ? {
              throws: new Error(errorMessage),
            }
          : { results: getTestData().testData },
    );

    // This test will output an error to the console. Let's silence it.
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    await renderSearchViewComponent();

    const searchInput = screen.getAllByRole('textbox')[0];
    await user.type(searchInput, 'abcdef1234567890abcdef1234567890abcdef12');
    act(() => void jest.runAllTimers());

    expect(global.fetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/try/push/?revision=abcdef1234567890abcdef1234567890abcdef12',
      undefined,
    );
    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
    expect(searchInput).toBeInvalid();
    expect(console.error).toHaveBeenCalledWith(
      'Error while fetching recent revisions:',
      new Error(errorMessage),
    );
  });

  it('should update error state with generic message if fetch error message is undefined', async () => {
    (global.fetch as FetchMockSandbox).get(
      'glob:https://treeherder.mozilla.org/api/project/*/push/*',
      (url) =>
        url.includes('?revision')
          ? {
              throws: new Error(),
            }
          : { results: getTestData().testData },
    );

    // This test will output an error to the console. Let's silence it.
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    await renderSearchViewComponent();

    const searchInput = screen.getAllByRole('textbox')[0];
    await user.type(searchInput, 'abcdef123456');
    act(() => void jest.runAllTimers());

    expect(global.fetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/try/push/?revision=abcdef123456',
      undefined,
    );
    expect(
      await screen.findByText('An error has occurred'),
    ).toBeInTheDocument();
    expect(searchInput).toBeInvalid();
    expect(console.error).toHaveBeenCalledWith(
      'Error while fetching recent revisions:',
      new Error(),
    );
  });
});
