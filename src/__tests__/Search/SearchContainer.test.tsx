import React from 'react';

import SearchContainer from '../../components/Search/SearchContainer';
import useProtocolTheme from '../../theme/protocolTheme';
import { renderWithRouter, renderHook } from '../utils/test-utils';

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
  });
});
