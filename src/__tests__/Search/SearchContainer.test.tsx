import React from 'react';

import fetchMock from '@fetch-mock/jest';

import { loader } from '../../components/Search/loader';
import SearchContainer from '../../components/Search/SearchContainer';
import getTestData from '../utils/fixtures';
import { renderWithRouter, screen } from '../utils/test-utils';

function setupTestData() {
  const { testData } = getTestData();
  fetchMock.get('begin:https://treeherder.mozilla.org/api/project/try/push/', {
    results: testData,
  });
}

function renderComponent() {
  setupTestData();
  const ref: React.RefObject<HTMLInputElement | null> = React.createRef();
  renderWithRouter(<SearchContainer containerRef={ref} />, { loader });
}

describe('Search Containter', () => {
  it('should match snapshot', async () => {
    renderComponent();
    await screen.findByText('Compare with a base or over time');

    expect(document.body).toMatchSnapshot();
  });
});
