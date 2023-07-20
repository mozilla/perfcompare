import { renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';

import SearchComponent from '../../components/Search/SearchComponent';
import SearchView from '../../components/Search/SearchView';
import { setSelectedRevisions } from '../../reducers/SelectedRevisionsSlice';
import { Strings } from '../../resources/Strings';
import useProtocolTheme from '../../theme/protocolTheme';
import { RevisionsList, InputType } from '../../types/state';
import getTestData from '../utils/fixtures';
import { renderWithRouter, store } from '../utils/setupTests';
import { screen, waitFor } from '../utils/test-utils';

const stringsBase = Strings.components.searchDefault.base.collapsed.base;

const protocolTheme = renderHook(() => useProtocolTheme()).result.current
  .protocolTheme;

const toggleColorMode = renderHook(() => useProtocolTheme()).result.current
  .toggleColorMode;
function renderComponent() {
  renderWithRouter(
    <SearchView
      toggleColorMode={toggleColorMode}
      protocolTheme={protocolTheme}
    />,
  );
}

function fetchTestData(data: RevisionsList[]) {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => ({
        results: data,
      }),
    }),
  ) as jest.Mock;
  jest.spyOn(global, 'fetch');
}

describe('Search View', () => {
  it('renders correctly when there are no results', async () => {
    renderComponent();

    // We have to account for the dropdown position
    //Shift focus to base search

    expect(document.body).toMatchSnapshot();
    await act(async () => void jest.runOnlyPendingTimers());
  });

  it('renders skip to search link correctly', async () => {
    renderComponent();
    expect(screen.getByRole('link', { name: /skip to search/i })).toBeInTheDocument();
  });

  it('renders a skip link that sends the focus directly to search container', async ()=>{
    renderComponent();
    await waitFor(()=> userEvent.tab() ); 
   await waitFor(()=> userEvent.keyboard('{Enter}'));
   expect(screen.queryByTestId('search-section')).toHaveFocus();    
  });
});

describe('Search Container', () => {
  it('renders compare with base', async () => {
    renderComponent();

    const title = screen.getAllByText('Compare with a base')[0];
    const baseInput = screen.getByPlaceholderText(
      'Search base by ID number or author email',
    );
    const repoDropdown = screen.getAllByTestId('dropdown-select-base')[0];

    expect(title).toBeInTheDocument();
    expect(baseInput).toBeInTheDocument();
    expect(repoDropdown).toBeInTheDocument();
    screen.debug();
  });
});

describe('Base Search', () => {
  it('renders repository dropdown in closed condition', async () => {
    renderComponent();
    // 'try' is selected by default and dropdown is not visible
    expect(screen.queryAllByText(/try/i)[0]).toBeInTheDocument();
    expect(screen.queryByText(/autoland/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/mozilla-central/i)).not.toBeInTheDocument();

    // Search input appears
    expect(
      screen.getByPlaceholderText(/Search base by ID number or author email/i),
    ).toBeInTheDocument();

    // No list items should appear
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();

    await act(async () => void jest.runOnlyPendingTimers());
  });

  it('renders framework dropdown in closed condition', async () => {
    renderComponent();
    // 'talos' is selected by default and dropdown is not visible
    expect(screen.queryByText(/talos/i)).toBeInTheDocument();
    expect(screen.queryByText(/build_metrics/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/awsy/i)).not.toBeInTheDocument();

    await act(async () => void jest.runOnlyPendingTimers());
  });

  it('should hide search results when clicking outside of search input', async () => {
    const { testData } = getTestData();
    fetchTestData(testData);
    // set delay to null to prevent test time-out due to useFakeTimers
    const searchType = 'base' as InputType;
    const user = userEvent.setup({ delay: null });
    renderComponent();

    //Click inside the input box to show search results.

    const searchInput = screen.getAllByRole('textbox')[0];
    await user.click(searchInput);

    await act(async () => {
      expect(store.getState().search[searchType].searchResults).toStrictEqual(
        testData,
      );
    });

    const comment = await screen.findAllByText("you've got no arms left!");
    expect(comment[0]).toBeInTheDocument();

    //Click outside the input box to hide search results.

    const label = screen.getAllByLabelText('Base')[0];
    await user.click(label);
    expect(comment[0]).not.toBeInTheDocument();
  });

  it('Should hide the search results when Escape key is pressed', async () => {
    const { testData } = getTestData();
    const searchType = 'base' as InputType;
    fetchTestData(testData);
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });
    renderComponent();

    //Click inside the input box to show search results.

    const searchInput = screen.getAllByRole('textbox')[0];
    await user.click(searchInput);

    await act(async () => {
      expect(store.getState().search[searchType].searchResults).toStrictEqual(
        testData,
      );
    });

    const comment = await screen.findAllByText("you've got no arms left!");
    expect(comment[0]).toBeInTheDocument();

    //Press Escape key to hide search results.

    await user.keyboard('{Escape}');
    expect(comment[0]).not.toBeInTheDocument();
  });

  it('Should not call fetch if search value is not a hash or email', async () => {
    const spyOnFetch = jest.spyOn(global, 'fetch');
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });
    renderComponent();

    const searchInput = screen.getAllByRole('textbox')[0];

    await user.type(searchInput, 'coconut');
    await user.clear(searchInput);

    await user.type(searchInput, 'spam@eggs');
    await user.clear(searchInput);
    await user.type(searchInput, 'spamspamspamand@eggs.');
    await user.clear(searchInput);
    await user.type(searchInput, 'iamalmostlongenoughtobeahashbutnotquite');

    await screen.findByText(
      'Search must be a 12- or 40-character hash, or email address',
    );

    // fetch is called 2 times on initial load
    expect(spyOnFetch).toHaveBeenCalledTimes(2);
  });

  it('Should clear search results if the search value is cleared', async () => {
    const { testData } = getTestData();
    fetchTestData(testData);
    const searchType = 'base' as InputType;
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });
    renderComponent();

    const searchInput = screen.getAllByRole('textbox')[0];
    await user.type(searchInput, 'terryjones@python.com');
    jest.runOnlyPendingTimers();
    const spyOnFetch = jest.spyOn(global, 'fetch');

    expect(spyOnFetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/try/push/?author=terryjones@python.com',
    );

    await screen.findAllByText("you've got no arms left!");
    act(() => {
      expect(store.getState().search[searchType].searchResults).toStrictEqual(
        testData,
      );
    });

    await user.clear(searchInput);
    act(() => {
      expect(store.getState().search[searchType].searchResults).toStrictEqual(
        [],
      );
    });

    expect(
      screen.queryByText("you've got no arms left!"),
    ).not.toBeInTheDocument();
  });

  it('should not hide search results when clicking search results', async () => {
    const { testData } = getTestData();
    fetchTestData(testData);
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
      screen.queryAllByText("you've got no arms left!")[0],
    ).toBeInTheDocument();
    expect(
      screen.queryAllByText("it's just a flesh wound")[0],
    ).toBeInTheDocument();
  });

  it('should update error state with generic message if fetch error is undefined', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error())) as jest.Mock;
    const searchType = 'base' as InputType;
    const spyOnFetch = jest.spyOn(global, 'fetch');
    const SearchPropsBase = {
      searchType,
      mode: 'light' as 'light' | 'dark',
      view: 'search' as 'search' | 'compare-results',
      isWarning: false,
      ...stringsBase,
    };
    renderComponent();

    renderWithRouter(<SearchComponent {...SearchPropsBase} />);

    await act(async () => void jest.runOnlyPendingTimers());

    expect(spyOnFetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/try/push/?hide_reviewbot_pushes=true',
    );
    act(() => {
      expect(store.getState().search[searchType].searchResults).toStrictEqual(
        [],
      );
    });
    act(() => {
      expect(store.getState().search[searchType].inputError).toBe(true);
    });

    act(() => {
      expect(store.getState().search[searchType].inputHelperText).toBe(
        'An error has occurred',
      );
    });
  });

  it('should have compare button and once clicked should redirect to results page with the right query params', async () => {
    const { testData } = getTestData();

    const { history } = renderWithRouter(
      <SearchView
        toggleColorMode={toggleColorMode}
        protocolTheme={protocolTheme}
      />,
    );
    expect(history.location.pathname).toEqual('/');

    const user = userEvent.setup({ delay: null });
    act(() => {
      store.dispatch(
        setSelectedRevisions({ selectedRevisions: testData.slice(0, 2) }),
      );
    });

    const compareButton = document.querySelector('.compare-button');
    await user.click(compareButton as HTMLElement);

    expect(history.location.pathname).toEqual('/compare-results');
    expect(history.location.search).toEqual(
      '?revs=coconut,spam&repos=try,mozilla-central',
    );
  });
});