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
});
