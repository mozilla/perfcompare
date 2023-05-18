import { renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';

//import { featureNotSupportedError } from '../../common/constants';
import SearchInput from '../../components/Search/beta/SearchInput';
import SearchView from '../../components/Search/beta/SearchView';
import SearchComponent from '../../components/Shared/beta/SearchComponent';
import { Strings } from '../../resources/Strings';
//import { setSelectedRevisions } from '../../reducers/SelectedRevisions';
import useProtocolTheme from '../../theme/protocolTheme';
import getTestData from '../utils/fixtures';
import { renderWithRouter, store } from '../utils/setupTests';
import { screen } from '../utils/test-utils';

const stringsBase = Strings.components.searchDefault.base.collaped.base;

describe('Search View', () => {
  const protocolTheme = renderHook(() => useProtocolTheme()).result.current
    .protocolTheme;

  const toggleColorMode = renderHook(() => useProtocolTheme()).result.current
    .toggleColorMode;
  it('renders correctly when there are no results', async () => {
    const baseRepo = store.getState().search.baseRepository;
    const inputErrorBase = store.getState().search.inputErrorBase;

    renderWithRouter(
      <SearchView
        toggleColorMode={toggleColorMode}
        protocolTheme={protocolTheme}
      />,
    );

    renderWithRouter(
      <SearchComponent
        {...stringsBase}
        view='search'
        mode='light'
        base='base'
        repository={baseRepo}
      />,
    );

    renderWithRouter(
      <SearchInput
        mode='light'
        setFocused={() => {}}
        view='search'
        inputPlaceholder='Search base by ID number or author email'
        base='base'
        inputError={inputErrorBase}
        inputHelperText='error'
      />,
    );

    // Base Select appears
    expect(screen.getAllByLabelText(/Base/i)[0]).toBeInTheDocument();

    // 'try' is selected by default and dropdown is not visible
    expect(screen.queryAllByText(/try/i)[0]).toBeInTheDocument();
    expect(screen.queryByText(/autoland/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/mozilla-central/i)).not.toBeInTheDocument();
    // Search input appears
    expect(
      screen.getAllByPlaceholderText(
        /Search base by ID number or author email/i,
      )[0],
    ).toBeInTheDocument();

    // No list items should appear
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();

    expect(document.body).toMatchSnapshot();
    await act(async () => void jest.runOnlyPendingTimers());
  });

  it('should hide search results when clicking outside of search input', async () => {
    const { testData } = getTestData();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => ({
          results: testData,
        }),
      }),
    ) as jest.Mock;
    jest.spyOn(global, 'fetch');
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    renderWithRouter(
      <SearchView
        toggleColorMode={toggleColorMode}
        protocolTheme={protocolTheme}
      />,
    );

    await screen.findAllByRole('button', { name: 'Base' });

    // focus input to show results
    const searchInput = screen.getAllByRole('textbox')[0];
    await user.click(searchInput);

    expect(store.getState().search.baseSearchResults).toStrictEqual(testData);

    await screen.findAllByText("you've got no arms left!");
    expect(
      screen.getAllByText("it's just a flesh wound")[0],
    ).toBeInTheDocument();

    expect(document.body).toMatchSnapshot();
  });

  it('should hide search results when Escape key is pressed', async () => {
    const { testData } = getTestData();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => ({
          results: testData,
        }),
      }),
    ) as jest.Mock;
    jest.spyOn(global, 'fetch');
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    renderWithRouter(
      <SearchView
        toggleColorMode={toggleColorMode}
        protocolTheme={protocolTheme}
      />,
    );

    await screen.findAllByRole('button', { name: 'Base' });

    // focus input to show results
    const searchInput = screen.getAllByRole('textbox')[0];
    await user.click(searchInput);

    await screen.findAllByText("you've got no arms left!");

    await user.keyboard('{Escape}');

    expect(
      screen.queryByText("you've got no arms left!"),
    ).not.toBeInTheDocument();
  });

  it('should not call fetch if searchValue is not a hash or email', async () => {
    const spyOnFetch = jest.spyOn(global, 'fetch');
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });
    const baseRepo = store.getState().search.baseRepository;

    renderWithRouter(
      <SearchView
        toggleColorMode={toggleColorMode}
        protocolTheme={protocolTheme}
      />,
    );

    renderWithRouter(
      <SearchComponent
        {...stringsBase}
        view='search'
        mode='light'
        base='base'
        repository={baseRepo}
      />,
    );

    const searchInput = screen.getAllByRole('textbox')[0];

    await user.type(searchInput, 'coconut');
    await user.clear(searchInput);
    await user.type(searchInput, 'spam@eggs');
    await user.clear(searchInput);
    await user.type(searchInput, 'spamspamspamand@eggs.');
    await user.clear(searchInput);
    await user.type(searchInput, 'iamalmostlongenoughtobeahashbutnotquite');

    await screen.findAllByText(
      'Search must be a 12- or 40-character hash, or email address',
    );

    // fetch should only be called on initial load
    // it's two now because we have to calls for both base and revision
    expect(spyOnFetch).toHaveBeenCalledTimes(2);
  });

  it('should clear searchResults if searchValue is cleared', async () => {
    const { testData } = getTestData();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => ({
          results: testData,
        }),
      }),
    ) as jest.Mock;
    const spyOnFetch = jest.spyOn(global, 'fetch');
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    renderWithRouter(
      <SearchView
        toggleColorMode={toggleColorMode}
        protocolTheme={protocolTheme}
      />,
    );

    await screen.findAllByRole('button', { name: 'Base' });

    const searchInput = screen.getAllByRole('textbox')[0];
    await user.type(searchInput, 'terryjones@python.com');
    jest.runOnlyPendingTimers();

    expect(spyOnFetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/try/push/?author=terryjones@python.com',
    );
    await screen.findAllByText("you've got no arms left!");
    expect(store.getState().search.baseSearchResults).toStrictEqual(testData);
    await user.clear(searchInput);
    expect(store.getState().search.baseSearchResults).toStrictEqual([]);
    expect(
      screen.queryByText("you've got no arms left!"),
    ).not.toBeInTheDocument();
  });

  it('should not hide search results when clicking search results', async () => {
    const { testData } = getTestData();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => ({
          results: testData,
        }),
      }),
    ) as jest.Mock;
    jest.spyOn(global, 'fetch');
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    renderWithRouter(
      <SearchView
        toggleColorMode={toggleColorMode}
        protocolTheme={protocolTheme}
      />,
    );

    await screen.findAllByRole('button', { name: 'Base' });

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
      screen.queryAllByText("you've got no arms left!")[0],
    ).toBeInTheDocument();
    expect(
      screen.queryAllByText("it's just a flesh wound")[0],
    ).toBeInTheDocument();

    expect(document.body).toMatchSnapshot();
  });

  it('should update error state if with generic message if fetch error is undefined', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error())) as jest.Mock;
    const spyOnFetch = jest.spyOn(global, 'fetch');

    renderWithRouter(
      <SearchView
        toggleColorMode={toggleColorMode}
        protocolTheme={protocolTheme}
      />,
    );

    await act(async () => void jest.runOnlyPendingTimers());

    expect(spyOnFetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/try/push/?hide_reviewbot_pushes=true',
    );
    expect(store.getState().search.baseSearchResults).toStrictEqual([]);
    expect(store.getState().search.inputErrorBase).toBe(true);
    expect(store.getState().search.inputHelperText).toBe(
      'An error has occurred',
    );
  });

  //disabling these tests until feature is implemented
  // eslint-disable-next-line jest/no-commented-out-tests
  /*

  it('should have compare button and once clicked should redirect to results page with the right query params', async () => {
    const { testData } = getTestData();
    store.dispatch(setSelectedRevisions(testData.slice(0, 2)));
    const { history } = renderWithRouter(
      <SearchView
        toggleColorMode={toggleColorMode}
        protocolTheme={protocolTheme}
      />,
    );
    expect(history.location.pathname).toEqual('/');

    const user = userEvent.setup({ delay: null });

    const compareButton = document.querySelector('.compare-button');
    await user.click(compareButton as HTMLElement);

    expect(history.location.pathname).toEqual('/compare-results');
    expect(history.location.search).toEqual(
      '?revs=coconut,spam&repos=try,mozilla-central',
    );
  });

  it('disable comparing without a base revision', async () => {
    const { testData } = getTestData();
    store.dispatch(setSelectedRevisions(testData.slice(0, 1)));
    const { history } = renderWithRouter(
      <SearchView
        toggleColorMode={toggleColorMode}
        protocolTheme={protocolTheme}
      />,
    );
    expect(history.location.pathname).toEqual('/');

    const user = userEvent.setup({ delay: null });

    const compareButton = document.querySelector('.compare-button');
    await user.click(compareButton as HTMLElement);

    expect(screen.getByText(featureNotSupportedError)).toBeInTheDocument();
    expect(history.location.pathname).toEqual('/');
  });

  it('disable comparing more than two revisions', async () => {
    const { testData } = getTestData();
    store.dispatch(setSelectedRevisions(testData.slice(0, 3)));
    const { history } = renderWithRouter(
      <SearchView
        toggleColorMode={toggleColorMode}
        protocolTheme={protocolTheme}
      />,
    );
    expect(history.location.pathname).toEqual('/');

    const user = userEvent.setup({ delay: null });

    const compareButton = document.querySelector('.compare-button');
    await user.click(compareButton as HTMLElement);

    expect(screen.getByText(featureNotSupportedError)).toBeInTheDocument();
    expect(history.location.pathname).toEqual('/');
  });

  */
});
