import React from 'react';

import SearchContainer from '../../components/Search/SearchContainer';
import getTestData from '../utils/fixtures';
import { renderWithRouter, FetchMockSandbox } from '../utils/test-utils';

function setupTestData() {
  const { testData } = getTestData();
  (global.fetch as FetchMockSandbox).get(
    'begin:https://treeherder.mozilla.org/api/project/try/push/',
    {
      results: testData,
    },
  );
}

function renderComponent() {
  setupTestData();
  const ref: React.RefObject<HTMLInputElement> = React.createRef();
  renderWithRouter(<SearchContainer containerRef={ref} />);
}

describe('Search Containter', () => {
  it('should match snapshot', async () => {
    renderComponent();

    expect(document.body).toMatchSnapshot();
  });
});
