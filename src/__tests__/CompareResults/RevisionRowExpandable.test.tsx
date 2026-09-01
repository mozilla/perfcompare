import { ReactElement } from 'react';

import fetchMock from '@fetch-mock/jest';

import { loader } from '../../components/CompareResults/loader';
import RevisionRowExpandable from '../../components/CompareResults/RevisionRowExpandable';
import getTestData from '../utils/fixtures';
import {
  screen,
  renderWithRouter,
  enableExpandedRowOptions,
} from '../utils/test-utils';

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

describe('RevisionRowExpandable for student-t testVersion', () => {
  it('should display median difference and percentage when both median values are present', async () => {
    const { testCompareData } = getTestData();
    // testCompareData[0]: base_median_value=704.84, new_median_value=712.44, unit='ms'
    // expected difference: 7.6, percentage: 1.08
    renderWithRoute(
      <RevisionRowExpandable
        result={testCompareData[0]}
        testVersion='student-t'
        id='test-1'
      />,
    );

    const header = await screen.findByText(/Difference of medians/);
    const medianBox = header.closest('div');
    expect(medianBox).toHaveTextContent('1.08%');
    expect(medianBox).toHaveTextContent('7.6 ms');
  });

  it('should not display median difference when median values are absent', async () => {
    const { testCompareData } = getTestData();
    const noMedians = {
      ...testCompareData[0],
      base_median_value: 0,
      new_median_value: 0,
    };

    renderWithRoute(
      <RevisionRowExpandable
        result={noMedians}
        testVersion='student-t'
        id='test-2'
      />,
    );

    await screen.findByText(/Difference of means/);
    expect(screen.queryByText(/Difference of medians/)).not.toBeInTheDocument();
  });
});

describe('RevisionRowExpandable for mann-whitney-u testVersion', () => {
  // These assert the (advanced) expanded-row components, hidden by default.
  beforeEach(() => enableExpandedRowOptions());

  it('should display warnings', async () => {
    const { mockMannWhitneyResultData } = getTestData();

    renderWithRoute(
      <RevisionRowExpandable
        result={mockMannWhitneyResultData}
        testVersion='mann-whitney-u'
        id={'666'}
      />,
    );

    const shapiroWarning =
      'Shapiro-Wilk test cannot be run on Base with fewer than 3 data points.';
    const shapiroWarning2 =
      'Shapiro-Wilk test cannot be run on New with fewer than 3 data points.';

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

describe('RevisionRowExpandable simplified Mann-Whitney-U view', () => {
  // Text unique to each advanced expanded-row component, used to assert whether
  // that component is currently rendered.
  const EFFECT_SIZE_TEXT = /Effect Size:/;
  const STATS_TABLE_TEXT = /Normality Test/;
  const WARNINGS_TEXT = /Shapiro-Wilk test cannot be run/;
  const MODES_LABEL = 'Mode-by-mode breakdown';

  function renderMwuRow() {
    const { mockMannWhitneyResultData } = getTestData();
    renderWithRoute(
      <RevisionRowExpandable
        result={mockMannWhitneyResultData}
        testVersion='mann-whitney-u'
        id='mwu-simple'
      />,
    );
  }

  it('shows the graph blurb and hides every advanced component by default', async () => {
    renderMwuRow();

    // The how-to-read blurb is always present in the simplified view.
    expect(
      await screen.findByText(/how the Base and New results are distributed/i),
    ).toBeInTheDocument();

    // None of the advanced (checkbox-gated) components render by default.
    expect(screen.queryByText(EFFECT_SIZE_TEXT)).not.toBeInTheDocument();
    expect(screen.queryByText(STATS_TABLE_TEXT)).not.toBeInTheDocument();
    expect(screen.queryByText(WARNINGS_TEXT)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(MODES_LABEL)).not.toBeInTheDocument();
  });

  it('reveals only the effect size component when that option is on', async () => {
    enableExpandedRowOptions({ effectSize: true });
    renderMwuRow();

    expect(await screen.findByText(EFFECT_SIZE_TEXT)).toBeInTheDocument();
    expect(screen.queryByText(STATS_TABLE_TEXT)).not.toBeInTheDocument();
    expect(screen.queryByText(WARNINGS_TEXT)).not.toBeInTheDocument();
  });

  it('reveals only the statistics table when that option is on', async () => {
    enableExpandedRowOptions({ statsTable: true });
    renderMwuRow();

    expect(await screen.findByText(STATS_TABLE_TEXT)).toBeInTheDocument();
    expect(screen.queryByText(EFFECT_SIZE_TEXT)).not.toBeInTheDocument();
    expect(screen.queryByText(WARNINGS_TEXT)).not.toBeInTheDocument();
  });

  it('reveals only the data warnings when that option is on', async () => {
    enableExpandedRowOptions({ warnings: true });
    renderMwuRow();

    // Base and New each contribute a Shapiro-Wilk warning.
    expect((await screen.findAllByText(WARNINGS_TEXT)).length).toBeGreaterThan(
      0,
    );
    expect(screen.queryByText(EFFECT_SIZE_TEXT)).not.toBeInTheDocument();
    expect(screen.queryByText(STATS_TABLE_TEXT)).not.toBeInTheDocument();
  });

  it('hides the mode-analysis controls (valley-depth slider + Show modes) by default', async () => {
    renderMwuRow();
    await screen.findByText(/how the Base and New results are distributed/i);

    expect(
      screen.queryByRole('slider', { name: /valley depth threshold/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('checkbox', { name: /show modes/i }),
    ).not.toBeInTheDocument();
  });

  it('reveals the mode-analysis controls when Mode analysis is enabled', async () => {
    enableExpandedRowOptions({ modes: true });
    renderMwuRow();

    expect(
      await screen.findByRole('slider', { name: /valley depth threshold/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: /show modes/i }),
    ).toBeInTheDocument();
  });

  it('shows a placeholder when Mode analysis is on but no breakdown is available', async () => {
    // The mock is a sparse/unimodal comparison, so no mode-by-mode breakdown is
    // produced; the cell should surface a placeholder rather than stay empty.
    enableExpandedRowOptions({ modes: true });
    renderMwuRow();

    expect(
      await screen.findByText(/No mode analysis available/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText('Mode-by-mode breakdown'),
    ).not.toBeInTheDocument();
  });
});
