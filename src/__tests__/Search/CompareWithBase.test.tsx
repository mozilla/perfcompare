import { renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';

import ResultsView from '../../components/CompareResults/beta/ResultsView';
import CompareWithBase from '../../components/Search/CompareWithBase';
import SearchView from '../../components/Search/SearchView';
import { updateCheckedRevisions } from '../../reducers/SearchSlice';
import { setSelectedRevisions } from '../../reducers/SelectedRevisionsSlice';
import { Strings } from '../../resources/Strings';
import useProtocolTheme from '../../theme/protocolTheme';
import getTestData from '../utils/fixtures';
import { renderWithRouter, store } from '../utils/setupTests';
import { screen } from '../utils/test-utils';

const warning =
  Strings.components.searchDefault.base.collapsed.warnings.comparison;

const protocolTheme = renderHook(() => useProtocolTheme()).result.current
  .protocolTheme;
const toggleColorMode = renderHook(() => useProtocolTheme()).result.current
  .toggleColorMode;
const themeMode = protocolTheme.palette.mode;
function renderComponent() {
  renderWithRouter(<CompareWithBase view='search' mode={themeMode} />);
}

describe('Compare With Base', () => {
  it('renders correctly when there are no results', async () => {
    renderComponent();

    expect(document.body).toMatchSnapshot();
    await act(async () => void jest.runOnlyPendingTimers());
  });

  it('toggles component open and closed on click', async () => {
    renderComponent();

    const user = userEvent.setup({ delay: null });
    const testExpandedID = 'base-state';
    const headerContent = screen.getByTestId(testExpandedID);

    //make sure it's in collapsed state first
    expect(
      screen
        .getAllByTestId('base-state')[0]
        .classList.contains('compare-card-container--expanded'),
    ).toBe(true);

    //make sure it's hidden when user clicks on title component
    await user.click(headerContent);
    expect(
      screen
        .getAllByTestId('base-state')[0]
        .classList.contains('compare-card-container--expanded'),
    ).toBe(false);

    await user.click(headerContent);
    expect(
      screen
        .getAllByTestId('base-state')[0]
        .classList.contains('compare-card-container--expanded'),
    ).toBe(true);
  });

  it('shows comparison warning when try repository is compared with a non try repository', async () => {
    renderComponent();

    const user = userEvent.setup({ delay: null });
    const baseDropdown = screen.getAllByRole('button', { name: 'Base' })[0];
    const newDropdown = screen.getByTestId('dropdown-select-new');

    await user.click(baseDropdown);

    expect(screen.getAllByText('try')[0]).toBeInTheDocument();
    await user.click(newDropdown);
    const mozRepoItem = screen.getAllByRole('option', {
      name: 'mozilla-central',
    })[0];

    expect(screen.getAllByText('mozilla-central')[0]).toBeInTheDocument();
    await user.click(mozRepoItem);
    const comparisonAlert = screen.getByText(warning);
    expect(comparisonAlert).toBeInTheDocument();
  });

  it('selects and displays new framework when clicked', async () => {
    renderComponent();
    const user = userEvent.setup({ delay: null });
    expect(screen.queryByText(/talos/i)).toBeInTheDocument();
    expect(screen.queryByText(/build_metrics/i)).not.toBeInTheDocument();
    const frameworkDropdown = screen.getByRole('button', {
      name: 'Framework talos',
    });

    await user.click(frameworkDropdown);
    const buildMetricsItem = screen.getByRole('option', {
      name: 'build_metrics',
    });

    await user.click(buildMetricsItem);

    expect(screen.queryAllByText(/build_metrics/i)[0]).toBeInTheDocument();
  });

  it('shows correct selected revisions when view is  `search` or `compare-results`', async () => {
    const { testData } = getTestData();
    const baseChecked = testData.slice(0, 1);
    const newChecked = testData.slice(1, 2);

    const { history } = renderWithRouter(
      <SearchView
        toggleColorMode={toggleColorMode}
        protocolTheme={protocolTheme}
      />,
    );
    act(() => {
      store.dispatch(
        updateCheckedRevisions({ newChecked: baseChecked, searchType: 'base' }),
      );
    });

    act(() => {
      store.dispatch(updateCheckedRevisions({ newChecked, searchType: 'new' }));
    });

    const selectedRevsSearch = screen.getAllByTestId('selected-revs-search')[0];

    expect(selectedRevsSearch).toBeInTheDocument();

    expect(history.location.pathname).toEqual('/');

    const user = userEvent.setup({ delay: null });

    const compareButton = document.querySelector('.compare-button');

    await user.click(compareButton as HTMLElement);

    expect(history.location.pathname).toEqual('/compare-results');

    expect(history.location.search).toEqual(
      '?revs=coconut,spam&repos=try,mozilla-central',
    );

    renderWithRouter(
      <ResultsView
        toggleColorMode={toggleColorMode}
        protocolTheme={protocolTheme}
      />,
    );

    const selectedRevs = testData.slice(0, 2);

    act(() => {
      store.dispatch(setSelectedRevisions({ selectedRevisions: selectedRevs }));
    });

    const selectedRevsResults = screen.getAllByTestId(
      'selected-revs-compare-results',
    )[0];

    expect(selectedRevsResults).toBeInTheDocument();
  });
});
