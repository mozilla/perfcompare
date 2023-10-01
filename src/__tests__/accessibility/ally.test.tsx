import { renderHook } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { act } from 'react-dom/test-utils';

import ResultsView from '../../components/CompareResults/ResultsView';
import { Strings } from '../../resources/Strings';
import useProtocolTheme from '../../theme/protocolTheme';
import getTestData from '../utils/fixtures';
import { renderWithRouter } from '../utils/setupTests';

expect.extend(toHaveNoViolations);

const protocolTheme = renderHook(() => useProtocolTheme()).result.current
  .protocolTheme;
const toggleColorMode = renderHook(() => useProtocolTheme()).result.current
  .toggleColorMode;

describe('Results view', () => {
  it('should be accessible in light mode', async () => {
    const { testData } = getTestData();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => ({
          results: testData,
        }),
      }),
    ) as jest.Mock;
    jest.spyOn(global, 'fetch');

    const { container } = renderWithRouter(
      <ResultsView
        protocolTheme={protocolTheme}
        toggleColorMode={toggleColorMode}
        title={Strings.metaData.pageTitle.results}
      />,
    );

    let results;
    jest.useRealTimers();
    await act(async () => {
      results = await axe(container);
    });
    jest.useFakeTimers();
    expect(results).toHaveNoViolations();
  });
});
