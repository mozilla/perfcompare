import type { ReactElement } from 'react';

import fetchMock from '@fetch-mock/jest';
import userEvent from '@testing-library/user-event';
import type { ScriptableContext } from 'chart.js';
import { ChartProps, Line } from 'react-chartjs-2';

import { loader } from '../../components/CompareResults/loader';
import ResultsView from '../../components/CompareResults/ResultsView';
import TestHeader from '../../components/CompareResults/TestHeader';
import { Strings } from '../../resources/Strings';
import { Colors } from '../../styles/Colors';
import type { Repository } from '../../types/state';
import type { Framework } from '../../types/types';
import { getLocationOrigin } from '../../utils/location';
import getTestData from '../utils/fixtures';
import { renderWithRouter, screen, waitFor } from '../utils/test-utils';

function renderWithRoute(component: ReactElement) {
  const { testCompareData, testData } = getTestData();
  fetchMock
    .get(
      'begin:https://treeherder.mozilla.org/api/perfcompare/results/',
      testCompareData,
    )
    .get('begin:https://treeherder.mozilla.org/api/project/', {
      results: [testData[0]],
    });

  return renderWithRouter(component, {
    route: '/compare-results/',
    search: '?baseRev=spam&baseRepo=mozilla-central&framework=2',
    loader,
  });
}

jest.mock('../../utils/location');
const mockedGetLocationOrigin = getLocationOrigin as jest.Mock;

describe('Results View', () => {
  it('The table should match snapshot and other elements should be present in the page', async () => {
    renderWithRoute(<ResultsView title={Strings.metaData.pageTitle.results} />);
    expect(await screen.findByRole('table')).toMatchSnapshot();

    const link = screen.getByRole('link', { name: /link to home/i });
    expect(link).toBeInTheDocument();
  });

  it('renders framework dropdown in closed condition', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderWithRoute(<ResultsView title={Strings.metaData.pageTitle.results} />);

    const header = await screen.findByText('Results');

    expect(header).toBeInTheDocument();

    const frameworkDropdown = screen.getByRole('combobox', {
      name: 'Framework',
    });

    expect(frameworkDropdown).toMatchSnapshot();

    expect(screen.getAllByText(/build_metrics/i)[0]).toBeInTheDocument();
    expect(screen.queryByText(/talos/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/awsy/i)).not.toBeInTheDocument();

    await user.click(frameworkDropdown);
    expect(screen.getByText(/awsy/i)).toBeInTheDocument();
  });

  it('renders test version dropdown defaults to student-t test', async () => {
    renderWithRoute(<ResultsView title={Strings.metaData.pageTitle.results} />);

    const header = await screen.findByText('Results');

    expect(header).toBeInTheDocument();

    const testVersionDropdown = screen.getByRole('combobox', {
      name: 'Stats Test Version',
    });

    expect(testVersionDropdown).toMatchSnapshot();
    expect(screen.getByText('Student-T')).toBeInTheDocument();
  });

  it('renders test version dropdown in closed condition', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderWithRoute(<ResultsView title={Strings.metaData.pageTitle.results} />);

    const header = await screen.findByText('Results');

    expect(header).toBeInTheDocument();

    const testVersionDropdown = screen.getByRole('combobox', {
      name: 'Stats Test Version',
    });

    expect(testVersionDropdown).toMatchSnapshot();
    await user.click(testVersionDropdown);

    expect(screen.getByText('Mann-Whitney-U')).toBeInTheDocument();
  });

  it('Should render revision header with link to suite docs', async () => {
    const revisionHeader = {
      extra_options: 'e10s fission stylo webgl-ipc webrender',
      framework_id: 1 as Framework['id'],
      new_repository_name: 'mozilla-central' as Repository['name'],
      new_rev: 'a998c42399a8fcea623690bf65bef49de20535b4',
      option_name: 'opt',
      suite: 'allyr',
      test: '3DGraphics-WebGL',
    };

    renderWithRoute(<TestHeader result={revisionHeader} withRevision={true} />);
    const linkToSuite = await screen.findByLabelText(
      'link to suite documentation',
    );
    expect(linkToSuite).toBeInTheDocument();
  });

  it('Should render revision header without link to suite docs for unsupported framework', async () => {
    const revisionHeader = {
      extra_options: 'e10s fission stylo webgl-ipc webrender',
      framework_id: 10 as Framework['id'],
      new_repository_name: 'mozilla-central' as Repository['name'],
      new_rev: 'a998c42399a8fcea623690bf65bef49de20535b4',
      option_name: 'opt',
      suite: 'idle-bg',
      test: '3DGraphics-WebGL',
    };

    renderWithRoute(<TestHeader result={revisionHeader} withRevision={true} />);
    await screen.findByText(/idle-bg/);
    const linkToSuite = screen.queryByLabelText('link to suite documentation');
    expect(linkToSuite).not.toBeInTheDocument();
  });

  it('Should display Base, New and Common graphs with tooltips', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    // We set up a compare data that has 1 result but with several runs, so that
    // the graphs are displayed for this result.
    const { testCompareDataWithMultipleRuns, testData } = getTestData();
    fetchMock
      .get(
        'begin:https://treeherder.mozilla.org/api/perfcompare/results/',
        testCompareDataWithMultipleRuns,
      )
      .get('begin:https://treeherder.mozilla.org/api/project/', {
        results: [testData[0]],
      });

    renderWithRouter(
      <ResultsView title={Strings.metaData.pageTitle.results} />,
      {
        route: '/compare-results/',
        search: '?baseRev=spam&baseRepo=mozilla-central&framework=2',
        loader,
      },
    );

    const expandButton = await screen.findByRole('button', {
      name: 'expand this row',
    });
    await user.click(expandButton);
    expect(
      await screen.findByRole('region', { name: 'Revision Row Details' }),
    ).toMatchSnapshot();

    // 1. Test that the chart library is called with various datasets.
    const MockedLine = Line as jest.Mock;
    const chartProps = MockedLine.mock.calls[0][0] as ChartProps;
    const datasets = chartProps.data.datasets;
    expect(datasets).toHaveLength(3);
    // The KDE dataset is too long to test here, but let's test the other
    // elements.
    const datasetsForKde = datasets.filter(
      (dataset) => 'yAxisID' in dataset && dataset.yAxisID === 'yKde',
    );
    expect(datasetsForKde).toMatchObject([
      {
        yAxisID: 'yKde',
        label: 'Base',
        fill: false,
        borderColor: Colors.ChartBase,
      },
      {
        yAxisID: 'yKde',
        label: 'New',
        fill: false,
        borderColor: Colors.ChartNew,
      },
    ]);

    const datasetForScatter = datasets.find(
      (dataset) => dataset.type === 'scatter',
    );
    expect(datasetForScatter).toMatchSnapshot('Dataset for scatter');

    // 2. Test the more complex tooltip functions with various use cases.
    const labelFunction =
      chartProps.options?.plugins?.tooltip?.callbacks?.label;
    expect(labelFunction).toBeDefined();

    const tooltipItemKdeBase = {
      dataset: datasetsForKde[0],
      parsed: { x: 5, y: 5 },
    };
    const tooltipItemKdeNew = {
      dataset: datasetsForKde[1],
      parsed: { x: 5, y: 5 },
    };
    const tooltipItemValueBase = {
      dataset: datasetForScatter,
      raw: {
        x: '1.234',
        y: 'Base',
      },
    };
    const tooltipItemValueNew = {
      dataset: datasetForScatter,
      raw: {
        x: '2.345',
        y: 'New',
      },
    };

    expect(
      labelFunction!.call(
        // @ts-expect-error This object doesn't obey fully to the type
        // description, but it's good enough to test our code.
        { dataPoints: [tooltipItemKdeBase] },
        tooltipItemKdeBase,
      ),
    ).toBe('@ 5.00');
    expect(
      labelFunction!.call(
        // @ts-expect-error This object doesn't obey fully to the type
        // description, but it's good enough to test our code.
        { dataPoints: [tooltipItemValueBase] },
        tooltipItemValueBase,
      ),
    ).toBe('Base: 1.234');
    expect(
      labelFunction!.call(
        // @ts-expect-error This object doesn't obey fully to the type
        // description, but it's good enough to test our code.
        { dataPoints: [tooltipItemValueNew] },
        tooltipItemValueNew,
      ),
    ).toBe('New: 2.345');

    // Also test the cases where there are 2 values at the same x point.
    // The first item shows a summary of both values.
    expect(
      labelFunction!.call(
        // @ts-expect-error This object doesn't obey fully to the type
        // description, but it's good enough to test our code.
        { dataPoints: [tooltipItemValueBase, { ...tooltipItemValueBase }] },
        tooltipItemValueBase,
      ),
    ).toBe('Base: 1.234 (×2)');
    // But the second item isn't displayed at all.
    expect(
      labelFunction!.call(
        // @ts-expect-error This object doesn't obey fully to the type
        // description, but it's good enough to test our code.
        { dataPoints: [{ ...tooltipItemValueBase }, tooltipItemValueBase] },
        tooltipItemValueBase,
      ),
    ).toBe('');

    // 3. Also test the complex color function
    const labelColorFunction =
      chartProps.options?.plugins?.tooltip?.callbacks?.labelColor;
    expect(labelColorFunction).toBeDefined();

    // @ts-expect-error This object doesn't obey fully to the type
    // description, but it's good enough to test our code.
    expect(labelColorFunction!(tooltipItemKdeBase)).toEqual({
      backgroundColor: Colors.ChartBase,
    });
    // @ts-expect-error This object doesn't obey fully to the type
    // description, but it's good enough to test our code.
    expect(labelColorFunction!(tooltipItemKdeNew)).toEqual({
      backgroundColor: Colors.ChartNew,
    });
    // @ts-expect-error This object doesn't obey fully to the type
    // description, but it's good enough to test our code.
    expect(labelColorFunction!(tooltipItemValueBase)).toEqual({
      backgroundColor: Colors.ChartBase,
    });
    // @ts-expect-error This object doesn't obey fully to the type
    // description, but it's good enough to test our code.
    expect(labelColorFunction!(tooltipItemValueNew)).toEqual({
      backgroundColor: Colors.ChartNew,
    });

    // 4. Also test the background color function for the scatter graph
    const backgroundColorFunction = datasetForScatter?.backgroundColor as (
      ctx: ScriptableContext<'line'>,
    ) => string | undefined;
    expect(backgroundColorFunction).toBeInstanceOf(Function);
    // @ts-expect-error This object doesn't obey fully to the type
    // description, but it's good enough to test our code.
    expect(backgroundColorFunction({ raw: { x: 5, y: 'Base' } })).toBe(
      Colors.ChartBase + '99',
    );
    // @ts-expect-error This object doesn't obey fully to the type
    // description, but it's good enough to test our code.
    expect(backgroundColorFunction({ raw: { x: 5, y: 'New' } })).toBe(
      Colors.ChartNew + '99',
    );
  });

  it('Should display Base, New and Common graphs with replicates', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    // We set up a compare data that has 1 result but with several runs, so that
    // the graphs are displayed for this result.
    const { testCompareDataWithReplicates, testData } = getTestData();
    fetchMock
      .get(
        'begin:https://treeherder.mozilla.org/api/perfcompare/results/',
        testCompareDataWithReplicates,
      )
      .get('begin:https://treeherder.mozilla.org/api/project/', {
        results: [testData[0]],
      });

    renderWithRouter(
      <ResultsView title={Strings.metaData.pageTitle.results} />,
      {
        route: '/compare-results/',
        search: '?baseRev=spam&baseRepo=mozilla-central&framework=2',
        loader,
      },
    );

    const expandButton = await screen.findByRole('button', {
      name: 'expand this row',
    });
    await user.click(expandButton);

    expect(
      await screen.findByRole('region', { name: 'Revision Row Details' }),
    ).toMatchSnapshot();

    // Test that this time all replicates are displayed
    const MockedLine = Line as jest.Mock;
    const chartProps = MockedLine.mock.calls[0][0] as ChartProps;
    const datasets = chartProps.data.datasets;
    const datasetForScatter = datasets.find(
      (dataset) => dataset.type === 'scatter',
    );
    expect(datasetForScatter!.data).toHaveLength(
      testCompareDataWithReplicates[0].base_runs_replicates.length +
        testCompareDataWithReplicates[0].new_runs_replicates.length,
    );
    expect(datasetForScatter).toMatchSnapshot('Dataset for scatter');
  });

  it('should make blobUrl available when "Download JSON" button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    const createObjectURLMock = jest.fn().mockReturnValue('blob:');
    global.URL.createObjectURL = createObjectURLMock;
    const revokeObjectURLMock = jest.fn();
    global.URL.revokeObjectURL = revokeObjectURLMock;

    // Render the component
    renderWithRoute(<ResultsView title={Strings.metaData.pageTitle.results} />);
    const button = await screen.findByText('Download JSON');
    await user.click(button);

    expect(createObjectURLMock).toHaveBeenCalled();
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:');
  });

  it('Clicking on the retrigger button should request an authorization code', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    const { testCompareDataWithMultipleRuns, testData } = getTestData();
    fetchMock
      .get(
        'begin:https://treeherder.mozilla.org/api/perfcompare/results/',
        testCompareDataWithMultipleRuns,
      )
      .get('begin:https://treeherder.mozilla.org/api/project/', {
        results: [testData[0]],
      });

    jest.spyOn(window, 'alert').mockImplementation();
    const mockedWindowAlert = window.alert as jest.Mock;
    jest.spyOn(window, 'open').mockImplementation();
    const mockedWindowOpen = window.open as jest.Mock;

    renderWithRouter(
      <ResultsView title={Strings.metaData.pageTitle.results} />,
      {
        route: '/compare-results/',
        search: '?baseRev=spam&baseRepo=mozilla-central&framework=2',
        loader,
      },
    );

    const retriggerButton = await screen.findByRole('button', {
      name: 'retrigger jobs',
    });

    // Test no clientId configured should alert
    mockedGetLocationOrigin.mockImplementation(() => 'http://test.com');
    await user.click(retriggerButton);
    expect(mockedWindowAlert).toHaveBeenCalledWith(
      'No clientId is configured for origin http://test.com, sorry!',
    );

    // Test requesting an authorization code from Taskcluster production URL
    mockedGetLocationOrigin.mockImplementation(() => 'http://localhost:3000');
    await user.click(retriggerButton);
    await user.click(await screen.findByRole('button', { name: /Sign in/ }));

    let windowOpenUrlString = mockedWindowOpen.mock.lastCall[0] as string;
    let windowOpenUrl = new URL(windowOpenUrlString);
    expect(sessionStorage.requestState).toBe(
      windowOpenUrl.searchParams.get('state'),
    );
    expect(sessionStorage.taskclusterUrl).toBe(windowOpenUrl.origin);

    // Test requesting an authorization code from Taskcluster staging URL
    window.location.hash = 'taskcluster-staging';
    await user.click(retriggerButton);
    windowOpenUrlString = mockedWindowOpen.mock.lastCall[0] as string;
    windowOpenUrl = new URL(windowOpenUrlString);
    expect(sessionStorage.requestState).toBe(
      windowOpenUrl.searchParams.get('state'),
    );
    expect(sessionStorage.taskclusterUrl).toBe(windowOpenUrl.origin);
  });

  it('Should show the input, cancel and save button when the user click edit title button', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    renderWithRoute(<ResultsView title={Strings.metaData.pageTitle.results} />);

    const editTitleButton = await screen.findByRole('button', {
      name: /Edit title/i,
    });

    await user.click(editTitleButton);

    const cancelButton = await screen.findByRole('button', {
      name: /Cancel/i,
    });
    const saveButton = await screen.findByRole('button', {
      name: /Save/i,
    });

    const editTitleInput = screen.getByRole('textbox', {
      name: 'Write a title for this comparison',
    });

    expect(cancelButton).toBeInTheDocument();
    expect(saveButton).toBeInTheDocument();
    expect(editTitleInput).toBeInTheDocument();
  });

  it('Should hide the input and show default title when the user clicks cancel button', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    renderWithRoute(<ResultsView title={Strings.metaData.pageTitle.results} />);

    await screen.findByRole('heading', { name: 'Results' });

    const editTitleButton = await screen.findByRole('button', {
      name: /Edit title/i,
    });

    await user.click(editTitleButton);

    expect(screen.queryByText('Results')).not.toBeInTheDocument();

    const cancelButton = await screen.findByRole('button', {
      name: /Cancel/i,
    });

    await user.click(cancelButton);

    const editTitleInput = screen.queryByRole('textbox', {
      name: 'Write a title for this comparison',
    });

    expect(editTitleInput).not.toBeInTheDocument();
    expect(screen.getByText('Results')).toBeInTheDocument();
  });

  it('Should show the previous title after the user inputs a new title and clicks the cancel button', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    renderWithRoute(<ResultsView title={Strings.metaData.pageTitle.results} />);

    await screen.findByRole('heading', { name: 'Results' });

    const editTitleButton = await screen.findByRole('button', {
      name: /Edit title/i,
    });
    await user.click(editTitleButton);

    const cancelButton = await screen.findByRole('button', {
      name: /Cancel/i,
    });

    const editTitleInput = screen.getByRole('textbox', {
      name: 'Write a title for this comparison',
    });

    await user.type(editTitleInput, 'New Title');
    await user.click(cancelButton);

    expect(screen.queryByText('New Title')).not.toBeInTheDocument();
    await screen.findByRole('heading', {
      name: 'Results',
    });
    expect(screen.getByText('Results')).toBeInTheDocument();
  });

  it("Should show error message when the input is empty and the user clicks the 'Save' button", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderWithRoute(<ResultsView title={Strings.metaData.pageTitle.results} />);
    await screen.findByRole('heading', { name: 'Results' });
    const editTitleButton = await screen.findByRole('button', {
      name: /Edit title/i,
    });
    await user.click(editTitleButton);

    const saveButton = await screen.findByRole('button', {
      name: /Save/i,
    });
    const editTitleInput = screen.getByRole('textbox', {
      name: 'Write a title for this comparison',
    });

    await user.clear(editTitleInput);
    await user.click(saveButton);

    expect(screen.getByText('Title cannot be empty')).toBeInTheDocument();
  });

  it('Should update url with new title and the table with the new title', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    renderWithRoute(<ResultsView title={Strings.metaData.pageTitle.results} />);

    await screen.findByRole('heading', { name: 'Results' });
    expect(screen.getByText('Results')).toBeInTheDocument();
    const editTitleButton = await screen.findByRole('button', {
      name: /Edit title/i,
    });
    await user.click(editTitleButton);
    const formName = 'edit results table title';
    const form = await screen.findByRole('form', {
      name: formName,
    });
    expect(form).toBeInTheDocument();

    const saveButton = await screen.findByRole('button', {
      name: /Save/i,
    });
    const editTitleInput = screen.getByRole('textbox', {
      name: 'Write a title for this comparison',
    });
    const titleName = 'New title';
    await user.clear(editTitleInput);
    await user.type(editTitleInput, titleName);

    await user.click(saveButton);
    await waitFor(async () => {
      expect(window.location.pathname).toBe('/compare-results/');
    });

    expect(form).toMatchSnapshot('After clicking the Save button');

    //this fixes not wrapped in act error for updates
    await waitFor(() => {
      expect(location.href).toContain('title=');
    });
    expect(screen.queryByText('Results')).not.toBeInTheDocument();
    expect(screen.getByText(titleName)).toBeInTheDocument();
  });
});
