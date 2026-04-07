import { ReactElement } from 'react';

import fetchMock from '@fetch-mock/jest';
import userEvent from '@testing-library/user-event';

import { loader } from '../../components/CompareResults/loader';
import SubtestsRevisionRow from '../../components/CompareResults/SubtestsResults/SubtestsRevisionRow';
import { MannWhitneyResultsItem } from '../../types/state';
import getTestData from '../utils/fixtures';
import { screen, renderWithRouter } from '../utils/test-utils';

function renderWithRoute(component: ReactElement) {
  fetchMock
    .get('begin:https://treeherder.mozilla.org/api/perfcompare/results/', [])
    .get('begin:https://treeherder.mozilla.org/api/project/', {
      results: [],
    });

  return renderWithRouter(component, {
    route: '/subtests-compare-results/',
    search: '?baseRev=spam&baseRepo=try&framework=1',
    loader,
  });
}

describe('SubtestsRevisionRow Component', () => {
  it('renders the component with correct data', async () => {
    const { subtestsResult } = getTestData();
    const mockGridTemplateColumns = '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr';
    renderWithRoute(
      <SubtestsRevisionRow
        result={subtestsResult[0]}
        gridTemplateColumns={mockGridTemplateColumns}
        replicates={false}
        testVersion='student-t'
      />,
    );

    // Check if all elements render correctly
    await screen.findByText('dhtml.html');
    expect(await screen.findByText('971.38 ms')).toBeInTheDocument();
    expect(await screen.findByText('982.41 ms')).toBeInTheDocument();
    expect(await screen.findByText('1.14 %')).toBeInTheDocument();
    expect(await screen.findByText('Low')).toBeInTheDocument();
    expect(document.body).toMatchSnapshot();
  });

  it('renders the Regression status with bg color', async () => {
    const { subtestsResult } = getTestData();
    const mockGridTemplateColumns = '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr';
    renderWithRoute(
      <SubtestsRevisionRow
        result={subtestsResult[2]}
        gridTemplateColumns={mockGridTemplateColumns}
        replicates={false}
        testVersion='student-t'
      />,
    );

    // Check if all elements render correctly
    await screen.findByText('regression.html');
    expect(await screen.findByText('Regression')).toBeInTheDocument();
  });

  it('renders the Improvement status with bg color', async () => {
    const { subtestsResult } = getTestData();
    const mockGridTemplateColumns = '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr';
    renderWithRoute(
      <SubtestsRevisionRow
        result={subtestsResult[3]}
        gridTemplateColumns={mockGridTemplateColumns}
        replicates={false}
        testVersion='student-t'
      />,
    );

    // Check if all elements render correctly
    await screen.findByText('improvement.html');
    expect(await screen.findByText('Improvement')).toBeInTheDocument();
  });

  it('renders browser name when base and new apps are different', async () => {
    const { subtestsResult } = getTestData();
    const mockGridTemplateColumns = '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr';
    renderWithRoute(
      <SubtestsRevisionRow
        result={subtestsResult[4]}
        gridTemplateColumns={mockGridTemplateColumns}
        replicates={false}
        testVersion='student-t'
      />,
    );

    // wait until all elements render correctly
    await screen.findByText('browser.html');

    expect(document.body).toMatchSnapshot();
    expect(await screen.findByText(/firefox/i)).toBeInTheDocument();
    expect(await screen.findByText(/chrome/i)).toBeInTheDocument();
  });

  it('renders doesnt render browser name when base and new apps are firefox or fenix', async () => {
    const { subtestsResult } = getTestData();
    const mockGridTemplateColumns = '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr';
    renderWithRoute(
      <SubtestsRevisionRow
        result={subtestsResult[0]}
        gridTemplateColumns={mockGridTemplateColumns}
        replicates={false}
        testVersion='student-t'
      />,
    );

    // wait until all elements render correctly
    await screen.findByText('dhtml.html');

    expect(document.body).toMatchSnapshot();
    expect(screen.queryByText(/firefox/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/chrome/i)).not.toBeInTheDocument();
  });

  it('renders subtests results with mann-whitney-u testVersion', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const { subtestsResult } = getTestData();
    const mockGridTemplateColumns = '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr';
    renderWithRoute(
      <SubtestsRevisionRow
        result={subtestsResult[0]}
        gridTemplateColumns={mockGridTemplateColumns}
        replicates={false}
        testVersion='mann-whitney-u'
      />,
    );
    const expandRowButton = await screen.findByTestId(/ExpandMoreIcon/);
    await user.click(expandRowButton);

    expect(
      await screen.findByText(/Goodness of Fit Test/i),
    ).toBeInTheDocument();
    expect(await screen.findByText(/Normality Test/i)).toBeInTheDocument();
  });

  it('renders subtests results defaulting to mann-whitney-u with no testVersion', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const { subtestsMannWhitneyResult } = getTestData();
    const mockGridTemplateColumns = '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr';
    renderWithRoute(
      <SubtestsRevisionRow
        result={subtestsMannWhitneyResult[0]}
        gridTemplateColumns={mockGridTemplateColumns}
        replicates={false}
      />,
    );
    const expandRowButton = await screen.findByTestId(/ExpandMoreIcon/);
    await user.click(expandRowButton);

    expect(await screen.findByText(/Normality Test/i)).toBeInTheDocument();
  });

  it('should display baseMean and newMean in subtests for student-t testVersion', async () => {
    const { subtestsResult } = getTestData();
    const mockGridTemplateColumns = '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr';
    renderWithRoute(
      <SubtestsRevisionRow
        result={subtestsResult[0]}
        gridTemplateColumns={mockGridTemplateColumns}
        replicates={false}
        testVersion='student-t'
      />,
    );

    const roles = await screen.findAllByRole('cell');
    const baseMean = roles[1]?.childNodes[0];
    expect(baseMean).toHaveTextContent('971.38');

    const newMean = roles[3]?.childNodes[0];
    expect(newMean).toHaveTextContent('982.41');
  });

  it('should display cliffs delta, significance, and effects size in subtests for mann-whitney-u testVersion', async () => {
    const { subtestsMannWhitneyResult } = getTestData();
    const mockGridTemplateColumns = '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr';
    renderWithRoute(
      <SubtestsRevisionRow
        result={subtestsMannWhitneyResult[0]}
        gridTemplateColumns={mockGridTemplateColumns}
        replicates={false}
        testVersion='mann-whitney-u'
      />,
    );

    const roles = await screen.findAllByRole('cell');
    const effects = roles[7]?.childNodes[0];
    expect(effects).toHaveTextContent('60.00%');

    const significanceCell = roles[8];
    expect(significanceCell?.querySelector('svg')).not.toBeNull();

    const cliffs_delta = roles[6]?.childNodes[1];
    expect(cliffs_delta).toHaveTextContent('0.02');
  });

  it('should handle regression status and class for direction_of_change for results of  mann-whitney-u testVersion', async () => {
    const { subtestsMannWhitneyResult } = getTestData();
    const mockGridTemplateColumns = '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr';
    renderWithRoute(
      <SubtestsRevisionRow
        result={subtestsMannWhitneyResult[0]}
        gridTemplateColumns={mockGridTemplateColumns}
        replicates={false}
        testVersion='mann-whitney-u'
      />,
    );

    const roles = await screen.findAllByRole('cell');
    const status = roles[5]?.childNodes[0];
    expect(status).toHaveTextContent('Regression');
    expect(status).toHaveClass('status-hint-regression');
  });

  it('should handle improvement status and class for direction_of_change for results of  mann-whitney-u testVersion', async () => {
    const { subtestsMannWhitneyResult } = getTestData();
    const mockGridTemplateColumns = '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr';
    renderWithRoute(
      <SubtestsRevisionRow
        result={subtestsMannWhitneyResult[1]}
        gridTemplateColumns={mockGridTemplateColumns}
        replicates={false}
        testVersion='mann-whitney-u'
      />,
    );

    const roles1 = await screen.findAllByRole('cell');
    const status1 = roles1[5]?.childNodes[0];
    expect(status1).toHaveTextContent('Improvement');
    expect(status1).toHaveClass('status-hint-improvement');
  });

  describe('median diff column normality gating', () => {
    const normalRuns = [5.1, 5.2, 4.9, 5.0, 5.05];
    const tooFewRuns = [5.0];
    const mockGridTemplateColumns = '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr';

    function makeResult(
      baseRuns: number[],
      newRuns: number[],
    ): MannWhitneyResultsItem {
      const { subtestsMannWhitneyResult } = getTestData();
      return {
        ...subtestsMannWhitneyResult[0],
        base_runs: baseRuns,
        new_runs: newRuns,
      };
    }

    it('shows dash when neither distribution is normal', async () => {
      renderWithRoute(
        <SubtestsRevisionRow
          result={makeResult(tooFewRuns, tooFewRuns)}
          gridTemplateColumns={mockGridTemplateColumns}
          replicates={false}
          testVersion='mann-whitney-u'
        />,
      );
      const roles = await screen.findAllByRole('cell');
      expect(roles[4]).toHaveTextContent('-');
    });

    it('shows value with warning icon when only one distribution is normal', async () => {
      renderWithRoute(
        <SubtestsRevisionRow
          result={makeResult(normalRuns, tooFewRuns)}
          gridTemplateColumns={mockGridTemplateColumns}
          replicates={false}
          testVersion='mann-whitney-u'
        />,
      );
      const roles = await screen.findAllByRole('cell');
      expect(roles[4]).not.toHaveTextContent('-');
      expect(roles[4].querySelector('svg[role="img"]')).toBeTruthy();
    });

    it('shows value without warning icon when both distributions are normal', async () => {
      renderWithRoute(
        <SubtestsRevisionRow
          result={makeResult(normalRuns, normalRuns)}
          gridTemplateColumns={mockGridTemplateColumns}
          replicates={false}
          testVersion='mann-whitney-u'
        />,
      );
      const roles = await screen.findAllByRole('cell');
      expect(roles[4]).not.toHaveTextContent('-');
      expect(roles[4].querySelector('svg[role="img"]')).toBeFalsy();
    });
  });
});
