import React from 'react';

import SearchContainer from '../../components/Search/SearchContainer';
import { renderWithRouter } from '../utils/test-utils';

function renderComponent() {
  const ref: React.RefObject<HTMLInputElement> = React.createRef();
  renderWithRouter(<SearchContainer containerRef={ref} />);
}

describe('Search Containter', () => {
  it('should match snapshot', async () => {
    renderComponent();

    expect(document.body).toMatchSnapshot();
  });
});
