import { renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';

import CompareWithBase from '../../components/Shared/CompareWithBase';
import useProtocolTheme from '../../theme/protocolTheme';
import { renderWithRouter } from '../utils/setupTests';
import { screen } from '../utils/test-utils';

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
    const testHiddenID = 'base-hidden';
    const testExpandedID = 'base-expanded';
    const hiddenID = screen.queryByTestId(testHiddenID);
    const headerContent = screen.getByTestId(testExpandedID);

    //make sure it's in collapsed state first
    expect(hiddenID).toBeNull();

    //make sure it's hidden when user clicks on title component
    await user.click(headerContent);
    const expandedID = screen.queryByTestId(testExpandedID);
    expect(expandedID).toBeNull();

    await user.click(headerContent);
    expect(hiddenID).toBeNull();
  });
});
