import { renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';

import CompareWithBase from '../../components/Search/CompareWithBase';
import { Strings } from '../../resources/Strings';
import useProtocolTheme from '../../theme/protocolTheme';
import { renderWithRouter } from '../utils/setupTests';
import { screen } from '../utils/test-utils';

const warning =
  Strings.components.searchDefault.base.collapsed.warnings.comparison;

const protocolTheme = renderHook(() => useProtocolTheme()).result.current
  .protocolTheme;
const themeMode = protocolTheme.palette.mode;
function renderComponent() {
  renderWithRouter(<CompareWithBase mode={themeMode} />);
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
});
