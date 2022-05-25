import React from 'react';

import ResultsView from '../../components/Results/ResultsView';
import { render, screen } from '../utils/test-utils';

test('Should match snapshot', () => {
  render(<ResultsView />);

  expect(screen).toMatchSnapshot();
});
