import { ReactElement } from 'react';

import fetchMock from '@fetch-mock/jest';

import { loader } from '../../components/CompareResults/loader';
import RevisionRowExpandable from '../../components/CompareResults/RevisionRowExpandable';
import getTestData from '../utils/fixtures';
import { screen, renderWithRouter } from '../utils/test-utils';

function renderWithRoute(component: ReactElement) {
  fetchMock
    .get('begin:https://treeherder.mozilla.org/api/perfcompare/results/', [])
    .get('begin:https://treeherder.mozilla.org/api/project/', {
      results: [],
    });

  return renderWithRouter(component, {
    route: '/compare-results/',
    search: '?baseRev=spam&baseRepo=mozilla-central&framework=2',
    loader,
  });
}

describe('RevisionRowExpandable for mann-whitney-u testVersion', () => {
  it('should display ModeInterpretation for mann-whitney-u', async () => {
    const { mockMannWhitneyResultData } = getTestData();

    renderWithRoute(
      <RevisionRowExpandable
        result={mockMannWhitneyResultData}
        testVersion='mann-whitney-u'
        id={'666'}
      />,
    );

    const modeStartHeader = await screen.findByText(/Mode Start/);
    const modeEndHeader = await screen.findByText(/Mode End/);
    const medianShiftHeader = await screen.findByText(/Median Shift/);
    expect(modeStartHeader).toBeInTheDocument();
    expect(modeEndHeader).toBeInTheDocument();
    expect(medianShiftHeader).toBeInTheDocument();

    const modeStart = await screen.findByText(/465883.93/);
    const modeEnd = await screen.findByText(/465892.07/);
    expect(modeStart).toBeInTheDocument();
    expect(modeEnd).toBeInTheDocument();

    const modeInterpretation = await screen.findByText(
      /Base and New revisions are unimodal/,
    );
    expect(modeInterpretation).toBeInTheDocument();
  });

  it('should render N/A values for MannWhitneyResultsItem with empty result.silverman_kde.modes list. for mann-whitney-u', async () => {
    const { mockMannWhitneyResultData } = getTestData();

    const noModes = {
      ...mockMannWhitneyResultData,
      silverman_kde: {
        ...(mockMannWhitneyResultData['silverman_kde'] ?? {}),
        base_locations: [465888.0],
        new_locations: [465888.0, 235888.2],
        modes: [],
      },
    };
    renderWithRoute(
      <RevisionRowExpandable
        result={noModes}
        testVersion='mann-whitney-u'
        id={'666'}
      />,
    );

    const modeStartHeader = await screen.findByText(/Mode Start/);
    const modeEndHeader = await screen.findByText(/Mode End/);
    const medianShiftHeader = await screen.findByText(/Median Shift/);
    expect(modeStartHeader).toBeInTheDocument();
    expect(modeEndHeader).toBeInTheDocument();
    expect(medianShiftHeader).toBeInTheDocument();
    const modeInterpretation = await screen.findByText(
      /Cannot calculate shift/,
    );
    expect(modeInterpretation).toBeInTheDocument();
  });

  it('should display warnings', async () => {
    const { mockMannWhitneyResultData } = getTestData();

    renderWithRoute(
      <RevisionRowExpandable
        result={mockMannWhitneyResultData}
        testVersion='mann-whitney-u'
        id={'666'}
      />,
    );

    const expectedWarning1 =
      'Less than 2 datapoints or no standard variance for a meaningful fit Kernel Density Estimator (KDE) with an ISJ bandwidth to Base.';
    const shapiroWarning =
      'Shapiro-Wilk test cannot be run on Base with fewer than 3 data points.';
    const shapiroWarning2 =
      'Shapiro-Wilk test cannot be run on New with fewer than 3 data points.';

    const warning1 = await screen.findByText(expectedWarning1);
    expect(warning1).toBeInTheDocument();
    const swWarning = await screen.findByText(shapiroWarning);
    expect(swWarning).toBeInTheDocument();
    const swWarning2 = await screen.findByText(shapiroWarning2);
    expect(swWarning2).toBeInTheDocument();
  });

  it('should render tests Shapiro-Wilk Test results in MannWhitneyCompareMetrics for Normality Test', async () => {
    const { mockMannWhitneyResultData } = getTestData();

    const shapiro_wilk_tests = {
      ...mockMannWhitneyResultData,
      shapiro_wilk_test_base: {
        ...(mockMannWhitneyResultData['shapiro_wilk_test_base'] ?? {}),
        test_name: 'Shapiro Wilk',
        stat: 0.2,
        pvalue: 0.24,
        interpretation: 'Base is likely not normal',
      },
      shapiro_wilk_test_new: {
        ...(mockMannWhitneyResultData['shapiro_wilk_test_new'] ?? {}),
        test_name: 'Shapiro Wilk',
        stat: 0.01,
        pvalue: 0.02,
        interpretation: 'New is likely normal',
      },
    };
    renderWithRoute(
      <RevisionRowExpandable
        result={shapiro_wilk_tests}
        testVersion='mann-whitney-u'
        id={'666'}
      />,
    );

    const newNormal = await screen.findByText(/New is likely normal/);
    expect(newNormal).toBeInTheDocument();
    const baseNotNormal = await screen.findByText(/Base is likely not normal/);
    expect(baseNotNormal).toBeInTheDocument();
    const pvalue_new = await screen.findByText(/0.24/);
    expect(pvalue_new).toBeInTheDocument();
    const pvalue_base = await screen.findByText(/0.02/);
    expect(pvalue_base).toBeInTheDocument();
  });

  it('should render tests Kolmogorov-Smirnov Test results in MannWhitneyCompareMetrics for Goodness of Fit test', async () => {
    const { mockMannWhitneyResultData } = getTestData();

    const ks_tests = {
      ...mockMannWhitneyResultData,
      ks_test: {
        ...(mockMannWhitneyResultData['shapiro_wilk_test_base'] ?? {}),
        test_name: 'Shapiro Wilk',
        stat: 1,
        pvalue: 1,
        interpretation: 'KS test p-value: 1.000, good fit',
      },
    };
    renderWithRoute(
      <RevisionRowExpandable
        result={ks_tests}
        testVersion='mann-whitney-u'
        id={'666'}
      />,
    );

    const goodFit = await screen.findByText(/KS test p-value: 1.000, good fit/);
    expect(goodFit).toBeInTheDocument();
  });
});
