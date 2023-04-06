import { renderHook } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

import SearchViewBeta from '../../components/Search/beta/SearchView';
import useProtocolTheme from '../../theme/protocolTheme';
import { renderWithRouter } from '../utils/setupTests';

describe('Search View', () => {
  const protocolTheme = renderHook(() => useProtocolTheme()).result.current
    .protocolTheme;

  const toggleColorMode = renderHook(() => useProtocolTheme()).result.current
    .toggleColorMode;

  it('renders correctly when there are no results', async () => {
    renderWithRouter(
      <SearchViewBeta
        toggleColorMode={toggleColorMode}
        protocolTheme={protocolTheme}
      />,
    );

    expect(document.body).toMatchSnapshot();
    await act(async () => void jest.runOnlyPendingTimers());
  });
});
