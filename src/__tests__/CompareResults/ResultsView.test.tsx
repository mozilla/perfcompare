import type { ReactElement } from 'react';

import fetchMock from '@fetch-mock/jest';
import userEvent from '@testing-library/user-event';
import { Bubble, ChartProps, Line } from 'react-chartjs-2';

import { loader } from '../../components/CompareResults/loader';
import ResultsView from '../../components/CompareResults/ResultsView';
import TestHeader from '../../components/CompareResults/TestHeader';
import { Strings } from '../../resources/Strings';
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
    await screen.findByText(testCompareDataWithMultipleRuns[0].platform);
    // TODO In the future it would be good to name this section with an
    // aria-label for example, which would help accessibility AND this test.
    expect(screen.getAllByRole('row')[1].nextSibling).toMatchSnapshot();

    const MockedBubble = Bubble as jest.Mock;

    const bubbleProps = MockedBubble.mock.calls.map(
      (call) => call[0] as ChartProps,
    );
    expect(bubbleProps[0].data.datasets[0].label).toBe('Base');
    expect(bubbleProps[1].data.datasets[0].label).toBe('New');

    const labelFunction =
      bubbleProps[0].options?.plugins?.tooltip?.callbacks?.label;
    expect(labelFunction).toBeDefined();

    // @ts-expect-error does not affect the test coverage
    // consider fixing it if we change the label function in the future
    const labelResult = labelFunction({ raw: { x: 5, y: 0, r: 10 } });
    expect(labelResult).toBe('5 ms');

    const MockedLine = Line as jest.Mock;
    const lineProps = MockedLine.mock.calls.map(
      (call) => call[0] as ChartProps,
    );
    const graphTitle = lineProps[0].options?.plugins?.title?.text;
    expect(graphTitle).toBeDefined();
    expect(graphTitle).toBe('Runs Density Distribution');
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

    await screen.findByText(testCompareDataWithReplicates[0].platform);
    // TODO In the future it would be good to name this section with an
    // aria-label for example, which would help accessibility AND this test.
    expect(screen.getAllByRole('row')[1].nextSibling).toMatchSnapshot();

    const MockedBubble = Bubble as jest.Mock;

    const bubbleProps = MockedBubble.mock.calls.map(
      (call) => call[0] as ChartProps,
    );
    expect(bubbleProps[0].data.datasets[0].label).toBe('Base');
    expect(bubbleProps[1].data.datasets[0].label).toBe('New');

    expect(bubbleProps[0].data.datasets[0].data).toHaveLength(4);
    expect(bubbleProps[0].data.datasets[0].data[3]).toStrictEqual({
      r: 10,
      x: 602.04,
      y: 0,
    });
    expect(bubbleProps[1].data.datasets[0].data).toHaveLength(5);
    expect(bubbleProps[1].data.datasets[0].data[4]).toStrictEqual({
      r: 10,
      x: 607.27,
      y: 0,
    });

    const labelFunction =
      bubbleProps[0].options?.plugins?.tooltip?.callbacks?.label;
    expect(labelFunction).toBeDefined();

    // @ts-expect-error does not affect the test coverage
    // consider fixing it if we change the label function in the future
    const labelResult = labelFunction({ raw: { x: 5, y: 0, r: 10 } });
    expect(labelResult).toBe('5 ms');

    const MockedLine = Line as jest.Mock;
    const lineProps = MockedLine.mock.calls.map(
      (call) => call[0] as ChartProps,
    );
    const graphTitle = lineProps[0].options?.plugins?.title?.text;
    expect(graphTitle).toBeDefined();
    expect(graphTitle).toBe('Runs Density Distribution');
  });

  it('Should display Base, New and Common graphs with 1 value and replicates', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    // We set up a compare data that has 1 result but with several runs, so that
    // the graphs are displayed for this result.
    const { testCompareDataWithReplicatesOneValue, testData } = getTestData();
    fetchMock
      .get(
        'begin:https://treeherder.mozilla.org/api/perfcompare/results/',
        testCompareDataWithReplicatesOneValue,
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

    await screen.findByText(testCompareDataWithReplicatesOneValue[0].platform);
    // TODO In the future it would be good to name this section with an
    // aria-label for example, which would help accessibility AND this test.
    expect(screen.getAllByRole('row')[1].nextSibling).toMatchSnapshot();

    const MockedBubble = Bubble as jest.Mock;

    const bubbleProps = MockedBubble.mock.calls.map(
      (call) => call[0] as ChartProps,
    );
    expect(bubbleProps[0].data.datasets[0].label).toBe('Base');
    expect(bubbleProps[1].data.datasets[0].label).toBe('New');

    expect(bubbleProps[0].data.datasets[0].data).toHaveLength(4);
    expect(bubbleProps[0].data.datasets[0].data[3]).toStrictEqual({
      r: 10,
      x: 602.04,
      y: 0,
    });
    expect(bubbleProps[1].data.datasets[0].data).toHaveLength(5);
    expect(bubbleProps[1].data.datasets[0].data[4]).toStrictEqual({
      r: 10,
      x: 607.27,
      y: 0,
    });

    const labelFunction =
      bubbleProps[0].options?.plugins?.tooltip?.callbacks?.label;
    expect(labelFunction).toBeDefined();

    // @ts-expect-error does not affect the test coverage
    // consider fixing it if we change the label function in the future
    const labelResult = labelFunction({ raw: { x: 5, y: 0, r: 10 } });
    expect(labelResult).toBe('5 ms');

    const MockedLine = Line as jest.Mock;
    const lineProps = MockedLine.mock.calls.map(
      (call) => call[0] as ChartProps,
    );
    const graphTitle = lineProps[0].options?.plugins?.title?.text;
    expect(graphTitle).toBeDefined();
    expect(graphTitle).toBe('Runs Density Distribution');
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
