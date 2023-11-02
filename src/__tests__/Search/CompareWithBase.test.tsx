import { renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';

import { repoMap } from '../../common/constants';
import CompareWithBase from '../../components/Search/CompareWithBase';
import useProtocolTheme from '../../theme/protocolTheme';
import type { Repository } from '../../types/state';
import getTestData from '../utils/fixtures';
import { renderWithRouter } from '../utils/setupTests';
import { screen } from '../utils/test-utils';

const protocolTheme = renderHook(() => useProtocolTheme()).result.current
  .protocolTheme;

const themeMode = protocolTheme.palette.mode;
function renderComponent() {
  const { testData } = getTestData();
  const selectedRevsBase = testData.slice(0, 1);
  const selectedRevsNew = testData.slice(1, 3);

  const displayedCheckedRevisions = {
    baseRevs: selectedRevsBase,
    newRevs: selectedRevsNew,
  };

  const baseRepos = selectedRevsBase.map((item) => {
    const selectedRep = repoMap[item.repository_id];
    return selectedRep;
  });

  const newRepos = selectedRevsNew.map((item) => {
    const selectedRep = repoMap[item.repository_id];
    return selectedRep;
  });

  const displayedRepositories = {
    baseRepos: baseRepos as Repository['name'][],
    newRepos: newRepos as Repository['name'][],
  };
  renderWithRouter(
    <CompareWithBase
      isEditable={false}
      mode={themeMode}
      displayedRevisions={displayedCheckedRevisions}
      displayedRepositories={displayedRepositories}
    />,
  );
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

  it('selects and displays new framework when clicked', async () => {
    renderComponent();
    const user = userEvent.setup({ delay: null });
    expect(screen.queryByText(/talos/i)).toBeInTheDocument();
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

    expect(screen.queryAllByText(/build_metrics/i)[0]).toBeInTheDocument();
  });
});
