import userEvent from '@testing-library/user-event';

import SearchView from '../../components/Search/SearchView';
import { Strings } from '../../resources/Strings';
import getTestData from '../utils/fixtures';
import {
  screen,
  act,
  renderWithRouter,
  FetchMockSandbox,
} from '../utils/test-utils';

describe('SearchView/fetchRevisionsByAuthor', () => {
  it('should fetch revisions by author if searchValue is an email address', async () => {
    const { testData } = getTestData();
    (global.fetch as FetchMockSandbox).get(
      'glob:https://treeherder.mozilla.org/api/project/*/push/*',
      {
        results: testData,
      },
    );

    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    renderWithRouter(<SearchView title={Strings.metaData.pageTitle.search} />);

    expect(screen.getAllByText('try')[0]).toBeInTheDocument();
    const searchInput = screen.getAllByRole('textbox')[0];
    await user.type(searchInput, 'johncleese@python.com');
    act(() => void jest.runAllTimers());

    expect(global.fetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/try/push/?author=johncleese%40python.com',
      undefined,
    );

    await screen.findAllByText("you've got no arms left!");
    expect(
      screen.getAllByText("it's just a flesh wound")[0],
    ).toBeInTheDocument();
  });

  it.only('should reject fetchRevisionsByAuthor if fetch returns no results', async () => {
    (global.fetch as FetchMockSandbox).get(
      'glob:https://treeherder.mozilla.org/api/project/*/push/*',
      (url) => ({
        results: url.includes('?author') ? [] : getTestData().testData,
      }),
    );

    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    renderWithRouter(<SearchView title={Strings.metaData.pageTitle.search} />);

    const searchInput = screen.getAllByRole('textbox')[0];
    await user.type(searchInput, 'ericidle@python.com');
    act(() => void jest.runAllTimers());

    expect(global.fetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/try/push/?author=ericidle%40python.com',
      undefined,
    );

    expect(await screen.findByText('No results found')).toBeInTheDocument();
    screen.debug();
    expect(searchInput).toBeInvalid();
  });

  it('should update error state if fetchRevisionsByAuthor returns an error', async () => {
    const errorMessage = 'It got better...';
    (global.fetch as FetchMockSandbox).get(
      'glob:https://treeherder.mozilla.org/api/project/*/push/*',
      (url) =>
        url.includes('?author')
          ? {
              throws: new Error(errorMessage),
            }
          : { results: getTestData().testData },
    );

    // This test will output an error to the console. Let's silence it.
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    renderWithRouter(<SearchView title={Strings.metaData.pageTitle.search} />);

    const searchInput = screen.getAllByRole('textbox')[0];
    await user.type(searchInput, 'grahamchapman@python.com');
    act(() => void jest.runAllTimers());

    expect(global.fetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/try/push/?author=grahamchapman%40python.com',
      undefined,
    );
    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
    expect(searchInput).toBeInvalid();
    expect(console.error).toHaveBeenCalledWith(
      'FetchRevisionsByAuthor ERROR: ',
      new Error(errorMessage),
    );
  });

  it('should update error state with generic message if fetch error message is undefined', async () => {
    (global.fetch as FetchMockSandbox).get(
      'glob:https://treeherder.mozilla.org/api/project/*/push/*',
      (url) =>
        url.includes('?author')
          ? {
              throws: new Error(),
            }
          : { results: getTestData().testData },
    );

    // This test will output an error to the console. Let's silence it.
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    renderWithRouter(<SearchView title={Strings.metaData.pageTitle.search} />);

    const searchInput = screen.getAllByRole('textbox')[0];
    await user.type(searchInput, 'grahamchapman@python.com');
    act(() => void jest.runAllTimers());

    expect(global.fetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/try/push/?author=grahamchapman%40python.com',
      undefined,
    );
    expect(
      await screen.findByText('An error has occurred'),
    ).toBeInTheDocument();
    expect(searchInput).toBeInvalid();
    expect(console.error).toHaveBeenCalledWith(
      'FetchRevisionsByAuthor ERROR: ',
      new Error(),
    );
  });
});
