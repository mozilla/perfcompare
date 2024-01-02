import userEvent from '@testing-library/user-event';

import { repoMap } from '../../common/constants';
import CompareWithBase from '../../components/Search/CompareWithBase';
import SearchView from '../../components/Search/SearchView';
import { Strings } from '../../resources/Strings';
import useProtocolTheme from '../../theme/protocolTheme';
import getTestData from '../utils/fixtures';
import { renderWithRouter, store } from '../utils/setupTests';
import { act, screen, renderHook, FetchMockSandbox } from '../utils/test-utils';

const protocolTheme = renderHook(() => useProtocolTheme()).result.current
  .protocolTheme;

const themeMode = protocolTheme.palette.mode;
function renderComponent(isEditable: boolean) {
  const { testData } = getTestData();
  const baseRevs = testData.slice(0, 1);
  const newRevs = testData.slice(1, 3);

  // The "??" operations below are so that Typescript doesn't wonder about the
  // undefined value later.
  const baseRepos = baseRevs.map(
    (item) => repoMap[item.repository_id] ?? 'try',
  );
  const newRepos = newRevs.map((item) => repoMap[item.repository_id] ?? 'try');

  renderWithRouter(
    <CompareWithBase
      isEditable={isEditable}
      mode={themeMode}
      baseRevs={baseRevs}
      newRevs={newRevs}
      baseRepos={baseRepos}
      newRepos={newRepos}
    />,
  );
}

describe('Compare With Base', () => {
  it('renders correctly when there are no results', async () => {
    renderComponent(false);

    expect(document.body).toMatchSnapshot();
    await act(async () => void jest.runOnlyPendingTimers());
  });

  it('toggles component open and closed on click', async () => {
    renderComponent(false);

    const user = userEvent.setup({ delay: null });
    const testExpandedID = 'base-state';
    const headerContent = screen.getByTestId(testExpandedID);

    //make sure it's in collapsed state first
    expect(screen.getAllByTestId('base-state')[0]).toHaveClass(
      'compare-card-container--expanded',
    );

    //make sure it's hidden when user clicks on title component
    await user.click(headerContent);
    expect(screen.getAllByTestId('base-state')[0]).not.toHaveClass(
      'compare-card-container--expanded',
    );

    await user.click(headerContent);
    expect(screen.getAllByTestId('base-state')[0]).toHaveClass(
      'compare-card-container--expanded',
    );
  });

  it('selects and displays new framework when clicked', async () => {
    renderComponent(false);
    const user = userEvent.setup({ delay: null });
    expect(screen.getByText(/talos/i)).toBeInTheDocument();
    expect(screen.queryByText(/build_metrics/i)).not.toBeInTheDocument();
    const frameworkDropdown = screen.getByRole('button', {
      name: 'Framework talos',
    });

    await user.click(frameworkDropdown);
    expect(screen.getByRole('listbox')).toMatchSnapshot();
    const buildMetricsItem = screen.getByRole('option', {
      name: 'build_metrics',
    });

    await user.click(buildMetricsItem);

    expect(screen.getAllByText(/build_metrics/i)[0]).toBeInTheDocument();
  });

  it('should remove the checked revision once X button is clicked', async () => {
    const { testData } = getTestData();
    (global.fetch as FetchMockSandbox).get(
      'begin:https://treeherder.mozilla.org/api/project/try/push/',
      {
        results: testData,
      },
    );

    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    const toggleColorMode = renderHook(() => useProtocolTheme()).result.current
      .toggleColorMode;

    renderWithRouter(
      <SearchView
        toggleColorMode={toggleColorMode}
        protocolTheme={protocolTheme}
        title={Strings.metaData.pageTitle.search}
      />,
    );

    const searchInput = screen.getAllByRole('textbox')[0];
    await user.click(searchInput);
    const checkbox = (await screen.findAllByTestId('checkbox-0'))[0];
    await user.click(checkbox);
    expect(checkbox).toHaveClass('Mui-checked');
    const removeButton = document.querySelectorAll(
      '[aria-label="close-button"]',
    );
    expect(removeButton[0]).toBeInTheDocument();
    expect(screen.getAllByTestId('selected-rev-item')[0]).toBeInTheDocument();

    await user.click(removeButton[0]);

    act(() => {
      expect(store.getState().search.base.checkedRevisions).toEqual([]);
    });
    expect(document.body).toMatchSnapshot();

    expect(screen.queryAllByTestId('selected-rev-item')[0]).toBeUndefined();
  });

  it('hides x icon when mode is isEditable', async () => {
    renderComponent(true);

    expect(screen.getAllByTestId('selected-rev-item')[0]).not.toHaveClass(
      'icon-close-hidden',
    );
  });
});
