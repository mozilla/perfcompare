import { ReactElement } from 'react';

import fetchMock from '@fetch-mock/jest';
import userEvent from '@testing-library/user-event';

import { compareView } from '../../common/constants';
import { loader } from '../../components/CompareResults/loader';
import RevisionRow from '../../components/CompareResults/RevisionRow';
import { CompareResultsItem } from '../../types/state';
import { Platform } from '../../types/types';
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

describe('<RevisionRow>', () => {
  it.each([
    {
      platform: 'linux1804-32-shippable-qr',
      shortName: 'Linux 18.04',
      hasIcon: true,
    },
    {
      platform: 'macosx1014-64-shippable-qr',
      shortName: 'macOS 10.14',
      hasIcon: true,
    },
    {
      platform: 'windows2012-64-shippable',
      shortName: 'Windows 2012',
      hasIcon: true,
    },
    {
      platform: 'android-5-0-aarch64-release',
      shortName: 'Android',
      hasIcon: true,
    },
    {
      platform: 'android-hw-p6-13-0-android-aarch64-shippable-qr',
      shortName: 'Android p6',
      hasIcon: true,
    },
    {
      platform: 'i am not an operating system',
      shortName: 'i am not an operating system',
      hasIcon: false,
    },
  ])(
    'shows correct platform info for platform "$platform"',
    async ({ platform, shortName, hasIcon }) => {
      const {
        testCompareData: [rowData],
      } = getTestData();

      rowData.platform = platform as Platform;
      renderWithRoute(
        <RevisionRow
          result={rowData}
          view={compareView}
          gridTemplateColumns='none'
          replicates={false}
          testVersion='student-t'
        />,
      );
      const shortNameNode = await screen.findByText(shortName);
      expect(shortNameNode).toBeInTheDocument();
      const previousNode = shortNameNode.previousSibling;
      /* eslint-disable jest/no-conditional-expect */
      if (hasIcon) {
        expect(previousNode?.nodeName).toBe('svg');
      } else {
        expect(previousNode).toBeNull();
      }
      /* eslint-enable */
    },
  );
});

describe('Expanded row', () => {
  it('should display "Show 39 more" and "Show less" for base runs when row is expanded', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const { testCompareDataWithReplicatesMultipleValues: rowData } =
      getTestData();

    renderWithRoute(
      <RevisionRow
        result={rowData[0] as CompareResultsItem}
        view={compareView}
        gridTemplateColumns='none'
        replicates={false}
        testVersion='student-t'
      />,
    );

    const expandRowButton = await screen.findByTestId(/ExpandMoreIcon/);
    await user.click(expandRowButton);

    const showMoreButton = await screen.findByText(/Show 39 more/);

    expect(showMoreButton).toBeInTheDocument();
    await user.click(showMoreButton);

    const showLessButton = await screen.findByText(/Show less/);

    expect(showLessButton).toBeInTheDocument();
  });

  it('should display direction of change for in RevisionRowExpandable mann-whitney-u testVersion when expanded', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const { mockMannWhitneyResultData } = getTestData();

    renderWithRoute(
      <RevisionRow
        result={mockMannWhitneyResultData}
        view={compareView}
        gridTemplateColumns='none'
        replicates={false}
        testVersion='mann-whitney-u'
      />,
    );

    const expandRowButton = await screen.findByTestId(/ExpandMoreIcon/);
    await user.click(expandRowButton);

    const noChangeText = await screen.findByText(/no change/);
    expect(noChangeText).toBeInTheDocument();
  });

  it('should display direction of change in RevisionRowExpandable for student-t testVersion when expanded', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const { testCompareData } = getTestData();

    renderWithRoute(
      <RevisionRow
        result={testCompareData[0]}
        view={compareView}
        gridTemplateColumns='none'
        replicates={false}
        testVersion='student-t'
      />,
    );

    const expandRowButton = await screen.findByTestId(/ExpandMoreIcon/);
    await user.click(expandRowButton);

    const betterText = await screen.findByText(/better/);
    expect(betterText).toBeInTheDocument();

    renderWithRoute(
      <RevisionRow
        result={testCompareData[2]}
        view={compareView}
        gridTemplateColumns='none'
        replicates={false}
        testVersion='student-t'
      />,
    );
    const expandRow = await screen.findByTestId(/ExpandMoreIcon/);
    await user.click(expandRow);

    const worseText = await screen.findByText(/worse/);
    expect(worseText).toBeInTheDocument();
  });

  it('should display new stats for mann-whitney-u testVersion', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const { testCompareMannWhitneyData: rowData } = getTestData();

    renderWithRoute(
      <RevisionRow
        result={rowData[0]}
        view={compareView}
        gridTemplateColumns='none'
        replicates={false}
        testVersion='mann-whitney-u'
      />,
    );

    const expandRowButton = await screen.findByTestId(/ExpandMoreIcon/);
    await user.click(expandRowButton);

    const normalityTestHeader = await screen.findByText(/Normality Test/);
    expect(normalityTestHeader).toBeInTheDocument();

    const goodnessFitTestHeader =
      await screen.findByText(/Goodness of Fit Test/);
    expect(goodnessFitTestHeader).toBeInTheDocument();

    const cliffsDeltaHeader = await screen.findByText(/Cliff's Delta/);
    expect(cliffsDeltaHeader).toBeInTheDocument();
  });

  it('should display mean for base or new in row headers for mann-whitney-u testVersion', async () => {
    const { testCompareMannWhitneyData: rowData } = getTestData();
    renderWithRoute(
      <RevisionRow
        result={rowData[0]}
        view={compareView}
        gridTemplateColumns='none'
        replicates={false}
        testVersion='mann-whitney-u'
      />,
    );

    const roles = await screen.findAllByRole('cell');
    const baseMean = roles[1]?.childNodes[0];
    expect(baseMean).toHaveTextContent('704.84');

    const newMean = roles[3]?.childNodes[0];
    expect(newMean).toHaveTextContent('712.44');

    const directionOfChange = roles[4]?.childNodes[0];
    expect(directionOfChange).toHaveTextContent('Better');

    const cliffsDelta = roles[5]?.childNodes[1];
    expect(cliffsDelta).toHaveTextContent('0.1');
  });

  it('should display N/A mean for missing baseAvgValue and newAvgValue in row headers for mann-whitney-u testVersion', async () => {
    const { testCompareMannWhitneyData: rowData } = getTestData();

    renderWithRoute(
      <RevisionRow
        result={rowData[3]}
        view={compareView}
        gridTemplateColumns='none'
        replicates={false}
        testVersion='mann-whitney-u'
      />,
    );

    const roles = await screen.findAllByRole('cell');
    const baseAvgValueNA = roles[1]?.childNodes[0];
    expect(baseAvgValueNA).toHaveTextContent('N/A');
    const newAvgValueNA = roles[3]?.childNodes[0];
    expect(newAvgValueNA).toHaveTextContent('N/A');
  });

  it('should display mean for base or new in row headers for student-t testVersion', async () => {
    const { testCompareData: rowData } = getTestData();
    renderWithRoute(
      <RevisionRow
        result={rowData[0]}
        view={compareView}
        gridTemplateColumns='none'
        replicates={false}
        testVersion='student-t'
      />,
    );

    const roles = await screen.findAllByRole('cell');
    const baseMean = roles[1]?.childNodes[0];
    expect(baseMean).toHaveTextContent('704.84');
    expect(baseMean).toHaveTextContent('ms');

    const newMean = roles[3]?.childNodes[0];
    expect(newMean).toHaveTextContent('712.44');
    expect(newMean).toHaveTextContent('ms');
  });

  it('should copy run values when "Copy values" is clicked', async () => {
    const writeTextMock = jest
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const { testCompareData } = getTestData();
    const baseRuns = testCompareData[0].base_runs.toString();

    renderWithRoute(
      <RevisionRow
        result={testCompareData[0]}
        view={compareView}
        gridTemplateColumns='none'
        replicates={false}
        testVersion='student-t'
      />,
    );

    const expandRowButton = await screen.findByTestId(/ExpandMoreIcon/);
    await user.click(expandRowButton);

    const copyResultsButton = await screen.findAllByText('Copy results');
    await user.click(copyResultsButton[0]);

    expect(writeTextMock).toHaveBeenCalledWith(baseRuns);
  });
});
