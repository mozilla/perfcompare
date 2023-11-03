import React from 'react';

import { renderHook } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

import SearchContainer from '../../components/Search/SearchContainer';
import useProtocolTheme from '../../theme/protocolTheme';
import { renderWithRouter } from '../utils/setupTests';

const protocolTheme = renderHook(() => useProtocolTheme()).result.current
  .protocolTheme;

const themeMode = protocolTheme.palette.mode;

function renderComponent() {
  const ref: React.RefObject<HTMLInputElement> = React.createRef();
  renderWithRouter(
    <SearchContainer containerRef={ref} themeMode={themeMode} />,
  );
}

describe('Search Containter', () => {
  it('should match snapshot', async () => {
    renderComponent();

    expect(document.body).toMatchSnapshot();
    await act(async () => void jest.runOnlyPendingTimers());
  });
});
