import userEvent from '@testing-library/user-event';

import { loader } from '../../components/Search/loader';
import SearchView from '../../components/Search/SearchView';
import { Strings } from '../../resources/Strings';
import getTestData from '../utils/fixtures';
import {
  screen,
  act,
  renderWithRouter,
  FetchMockSandbox,
} from '../utils/test-utils';

async function renderSearchViewComponent() {
  renderWithRouter(<SearchView title={Strings.metaData.pageTitle.search} />, {
    loader,
    route: '/',
    search: '?useFulltextSearch',
  });
  const title = 'Compare with a base';
  const compTitle = await screen.findByRole('heading', { name: title });
  expect(compTitle).toBeInTheDocument();
}

describe('SearchView/fetchRevisions', () => {
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

    await renderSearchViewComponent();

    expect(screen.getAllByText('try')[0]).toBeInTheDocument();
    const searchInput = screen.getAllByRole('textbox')[0];
    await user.type(searchInput, 'johncleese@python.com');
    act(() => void jest.runAllTimers());
    expect(global.fetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/try/push/?search=johncleese%40python.com',
      undefined,
    );

    await screen.findAllByText("you've got no arms left!");
    expect(
      screen.getAllByText("it's just a flesh wound")[0],
    ).toBeInTheDocument();
  });

  it('should fetch revisions by bug number', async () => {
    const { testData } = getTestData();
    (global.fetch as FetchMockSandbox).get(
      'glob:https://treeherder.mozilla.org/api/project/*/push/*',
      {
        results: testData,
      },
    );

    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    await renderSearchViewComponent();

    expect(screen.getAllByText('try')[0]).toBeInTheDocument();
    const searchInput = screen.getAllByRole('textbox')[0];
    await user.type(searchInput, '123456');
    act(() => void jest.runAllTimers());
    expect(global.fetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/try/push/?search=123456',
      undefined,
    );

    await screen.findAllByText('Bug 123456 Fuzzy She turned me into a newt!');
    expect(
      screen.getAllByText("it's just a flesh wound")[0],
    ).toBeInTheDocument();
  });

  it('should fetch revisions by comments', async () => {
    const { testData } = getTestData();
    (global.fetch as FetchMockSandbox).get(
      'glob:https://treeherder.mozilla.org/api/project/*/push/*',
      {
        results: testData,
      },
    );

    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    await renderSearchViewComponent();

    expect(screen.getAllByText('try')[0]).toBeInTheDocument();
    const searchInput = screen.getAllByRole('textbox')[0];
    await user.type(searchInput, 'Fuzzy');
    act(() => void jest.runAllTimers());
    expect(global.fetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/try/push/?search=Fuzzy',
      undefined,
    );

    await screen.findAllByText('Bug 123456 Fuzzy She turned me into a newt!');
    expect(
      screen.getAllByText("it's just a flesh wound")[0],
    ).toBeInTheDocument();
  });

  it('should reject fetchRevisionsByAuthor if fetch returns no results', async () => {
    (global.fetch as FetchMockSandbox).get(
      'glob:https://treeherder.mozilla.org/api/project/*/push/*',
      (url) => ({
        results: url.includes('?search') ? [] : getTestData().testData,
      }),
    );

    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    await renderSearchViewComponent();

    const searchInput = screen.getAllByRole('textbox')[0];
    await user.type(searchInput, 'ericidle@python.com');
    act(() => void jest.runAllTimers());

    expect(global.fetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/try/push/?search=ericidle%40python.com',
      undefined,
    );

    expect(await screen.findByText('No results found')).toBeInTheDocument();
    expect(searchInput).toBeInvalid();
  });

  it('should update error state if fetchRevisionsByAuthor returns an error', async () => {
    const errorMessage = 'It got better...';
    (global.fetch as FetchMockSandbox).get(
      'glob:https://treeherder.mozilla.org/api/project/*/push/*',
      (url) =>
        url.includes('?search')
          ? {
              throws: new Error(errorMessage),
            }
          : { results: getTestData().testData },
    );

    // This test will output an error to the console. Let's silence it.
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    await renderSearchViewComponent();

    const searchInput = screen.getAllByRole('textbox')[0];
    await user.type(searchInput, 'grahamchapman@python.com');
    act(() => void jest.runAllTimers());

    expect(global.fetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/try/push/?search=grahamchapman%40python.com',
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
        url.includes('?search')
          ? {
              throws: new Error(),
            }
          : { results: getTestData().testData },
    );

    // This test will output an error to the console. Let's silence it.
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    await renderSearchViewComponent();

    const searchInput = screen.getAllByRole('textbox')[0];
    await user.type(searchInput, 'grahamchapman@python.com');
    act(() => void jest.runAllTimers());

    expect(global.fetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/try/push/?search=grahamchapman%40python.com',
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
