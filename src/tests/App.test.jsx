/**
 * @jest-environment jsdom
 */
import React from 'react';

import { render, screen } from '@testing-library/react';

import App from '../components/App';
import * as SearchView from '../components/Search/SearchView';

test('Should render search view on default route', () => {
  jest
    .spyOn(SearchView, 'default')
    .mockImplementation(() => <div>SearchViewMock</div>);

  render(<App />);

  expect(screen.getByText('SearchViewMock')).toBeInTheDocument();
});
