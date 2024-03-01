/* eslint-disable jest/no-disabled-tests */
import type { ReactElement } from 'react';

import userEvent from '@testing-library/user-event';
import { Bubble, ChartProps, Line } from 'react-chartjs-2';

import { loader } from '../../components/CompareResults/loader';
import ResultsView from '../../components/CompareResults/ResultsView';
import RevisionHeader from '../../components/CompareResults/RevisionHeader';
import { setSelectedRevisions } from '../../reducers/SelectedRevisionsSlice';
import { Strings } from '../../resources/Strings';
import { RevisionsHeader } from '../../types/state';
import getTestData from '../utils/fixtures';
import { store } from '../utils/setupTests';
import {
  renderWithRouter,
  screen,
  act,
  FetchMockSandbox,
} from '../utils/test-utils';

function renderWithRoute(component: ReactElement) {
  const { testCompareData, testData } = getTestData();
  (window.fetch as FetchMockSandbox)
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

describe('Results View', () => {
  it('The table should match snapshot and other elements should be present in the page', async () => {
    renderWithRoute(<ResultsView title={Strings.metaData.pageTitle.results} />);
    expect(await screen.findByRole('table')).toMatchSnapshot();

    const link = screen.getByRole('link', { name: /link to home/i });
    expect(link).toBeInTheDocument();
  });

  // TODO Edit mode is not implemented properly currently
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('The CompareWithBase component should have an edit mode', async () => {
    renderWithRoute(<ResultsView title={Strings.metaData.pageTitle.results} />);
    expect(await screen.findByText('Compare with a base')).toBeInTheDocument();
    const formElement = await screen.findByRole('form');
    expect(formElement).toMatchSnapshot('Initial state for the form');

    const user = userEvent.setup({ delay: null });

    // add some selected revs to the selection
    // TODO: handle this with the URL instead
    const { testData } = getTestData();
    const selectedRevs = testData.slice(0, 2);
    act(() => {
      store.dispatch(setSelectedRevisions({ selectedRevisions: selectedRevs }));
    });

    // Find out if the base revision is rendered
    const baseRevisionText = screen.getByText(/you've got no arms left!/);
    const newRevisionText = screen.getByText(/just a flesh wound/);
    expect(baseRevisionText).toBeInTheDocument();
    expect(newRevisionText).toBeInTheDocument();

    // The search container should be hidden
    const baseSearchContainer = document.querySelector(
      '#base-search-container',
    );
    expect(baseSearchContainer).toHaveClass('hide-container');

    // Click the edit button
    let editButton = screen.getAllByRole('button', { name: 'edit button' })[0];
    await user.click(editButton);

    expect(baseSearchContainer).toHaveClass('show-container');

    expect(formElement).toMatchSnapshot(
      'After clicking edit for the base revision',
    );
    expect(editButton).not.toBeInTheDocument();

    // Press the cancel button should hide input and dropdown
    const cancelButton = screen.getByRole('button', { name: 'cancel button' });
    await user.click(cancelButton);

    expect(baseSearchContainer).toHaveClass('hide-container');

    // Click the edit button again
    editButton = screen.getAllByRole('button', { name: 'edit button' })[0];
    await user.click(editButton);
    expect(baseSearchContainer).toHaveClass('show-container');

    // Remove the base revision by clicking the X button
    const closeBaseButton = screen.getByRole('button', {
      name: 'close-button',
    });
    await user.click(closeBaseButton);
    expect(baseRevisionText).not.toBeInTheDocument();

    // Click the save button
    const saveButtonBase = screen.getByRole('button', { name: 'save button' });
    await user.click(saveButtonBase);

    // The baseRevision is still hidden
    expect(baseRevisionText).not.toBeInTheDocument();

    // The search container is hidden.
    expect(baseSearchContainer).toHaveClass('hide-container');

    // Do the same operation with the components for the "new" revisions
    const newSearchContainer = document.querySelector('#new-search-container');
    expect(newSearchContainer).toHaveClass('hide-container');

    // Click the edit button
    editButton = screen.getAllByRole('button', { name: 'edit button' })[1];
    await user.click(editButton);
    expect(formElement).toMatchSnapshot(
      'After clicking edit for the new revision',
    );
    expect(newSearchContainer).toHaveClass('show-container');

    // Remove the new revision by clicking the X button
    const closeNewButton = screen.getByRole('button', {
      name: 'close-button',
    });
    await user.click(closeNewButton);
    expect(newRevisionText).not.toBeInTheDocument();

    // Click the save button
    const saveButtonNew = screen.getByRole('button', { name: 'save button' });
    await user.click(saveButtonNew);
    expect(newSearchContainer).toHaveClass('hide-container');
  });

  it('Should render revision header with link to suite docs', async () => {
    const revisionHeader: RevisionsHeader = {
      extra_options: 'e10s fission stylo webgl-ipc webrender',
      framework_id: 1,
      new_repo: 'mozilla-central',
      new_rev: 'a998c42399a8fcea623690bf65bef49de20535b4',
      option_name: 'opt',
      suite: 'allyr',
      test: '3DGraphics-WebGL',
    };

    renderWithRoute(<RevisionHeader header={revisionHeader} />);
    const linkToSuite = await screen.findByLabelText(
      'link to suite documentation',
    );
    expect(linkToSuite).toBeInTheDocument();
  });

  it('Should render revision header without link to suite docs for unsupported framework', async () => {
    const revisionHeader: RevisionsHeader = {
      extra_options: 'e10s fission stylo webgl-ipc webrender',
      framework_id: 10,
      new_repo: 'mozilla-central',
      new_rev: 'a998c42399a8fcea623690bf65bef49de20535b4',
      option_name: 'opt',
      suite: 'idle-bg',
      test: '3DGraphics-WebGL',
    };

    renderWithRoute(<RevisionHeader header={revisionHeader} />);
    await screen.findByText(/idle-bg/);
    const linkToSuite = screen.queryByLabelText('link to suite documentation');
    expect(linkToSuite).not.toBeInTheDocument();
  });

  it('Should display Base, New and Common graphs with tooltips', async () => {
    const user = userEvent.setup({ delay: null });

    // We set up a compare data that has 1 result but with several runs, so that
    // the graphs are displayed for this result.
    const { testCompareDataWithMultipleRuns, testData } = getTestData();
    (window.fetch as FetchMockSandbox)
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
    expect(await screen.findByTestId('expanded-row-content')).toMatchSnapshot();

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
    const user = userEvent.setup({ delay: null });

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
});
