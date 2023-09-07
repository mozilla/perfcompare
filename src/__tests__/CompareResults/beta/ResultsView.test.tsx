import userEvent from '@testing-library/user-event';
import { Bubble, ChartProps } from 'react-chartjs-2';

import ResultsView from '../../../components/CompareResults/beta/ResultsView';
import RevisionHeader from '../../../components/CompareResults/beta/RevisionHeader';
import { setSelectedRevisions } from '../../../reducers/SelectedRevisionsSlice';
import { Strings } from '../../../resources/Strings';
import useProtocolTheme from '../../../theme/protocolTheme';
import { RevisionsHeader } from '../../../types/state';
import getTestData from '../../utils/fixtures';
import { renderWithRouter, store } from '../../utils/setupTests';
import { renderHook, screen, waitFor, act } from '../../utils/test-utils';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual<typeof import('react-router-dom')>('react-router-dom'),
  useSearchParams: () => [new URLSearchParams({ fakedata: 'true' })],
}));

describe('Results View', () => {
  const protocolTheme = renderHook(() => useProtocolTheme()).result.current
    .protocolTheme;
  const toggleColorMode = renderHook(() => useProtocolTheme()).result.current
    .toggleColorMode;

  it('Should match snapshot', () => {
    renderWithRouter(
      <ResultsView
        protocolTheme={protocolTheme}
        toggleColorMode={toggleColorMode}
        title={Strings.metaData.pageTitle.results}
      />,
    );
    expect(
      screen.getByTestId('beta-version-compare-results'),
    ).toBeInTheDocument();
    expect(document.body).toMatchSnapshot();
  });

  it('Should render the Compare with a Base component', () => {
    renderWithRouter(
      <ResultsView
        protocolTheme={protocolTheme}
        toggleColorMode={toggleColorMode}
        title={Strings.metaData.pageTitle.results}
      />,
    );

    expect(screen.getByText('Compare with a base')).toBeInTheDocument();
  });

  it('Should render the selected revisions', async () => {
    const { testData } = getTestData();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => ({
          results: testData,
        }),
      }),
    ) as jest.Mock;
    jest.spyOn(global, 'fetch');

    renderWithRouter(
      <ResultsView
        protocolTheme={protocolTheme}
        toggleColorMode={toggleColorMode}
        title={Strings.metaData.pageTitle.results}
      />,
    );

    const selectedRevisions = testData.slice(0, 5);
    await act(async () => {
      store.dispatch(
        setSelectedRevisions({ selectedRevisions: selectedRevisions }),
      );
    });

    expect(
      screen.getAllByTestId('selected-revs-compare-results')[0],
    ).toBeInTheDocument();
    expect(screen.getAllByTestId('selected-rev-item')[0]).toBeInTheDocument();
  });

  it('should render a home link', async () => {
    const { testData } = getTestData();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => ({
          results: testData,
        }),
      }),
    ) as jest.Mock;
    jest.spyOn(global, 'fetch');

    const selectedRevisions = testData.slice(0, 2);
    await act(async () => {
      store.dispatch(
        setSelectedRevisions({ selectedRevisions: selectedRevisions }),
      );
    });

    renderWithRouter(
      <ResultsView
        protocolTheme={protocolTheme}
        toggleColorMode={toggleColorMode}
        title={Strings.metaData.pageTitle.results}
      />,
    );
    const link = screen.getByLabelText(/link to home/i);
    expect(link).toBeInTheDocument();
  });

  it('should remove the selected revision once X button is clicked', async () => {
    const { testData } = getTestData();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => ({
          results: testData,
        }),
      }),
    ) as jest.Mock;
    jest.spyOn(global, 'fetch');

    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    const selectedRevisions = testData.slice(0, 2);
    await act(async () => {
      store.dispatch(
        setSelectedRevisions({ selectedRevisions: selectedRevisions }),
      );
    });

    renderWithRouter(
      <ResultsView
        protocolTheme={protocolTheme}
        toggleColorMode={toggleColorMode}
        title={Strings.metaData.pageTitle.results}
      />,
    );

    const removeButton = document.querySelectorAll(
      '[aria-label="close-button"]',
    );

    const removeIcon = screen.getAllByTestId('close-icon')[0];
    expect(removeIcon).toBeInTheDocument();
    expect(screen.getAllByTestId('selected-rev-item')[1]).toBeInTheDocument();

    await user.click(removeButton[0]);

    act(() => {
      expect(store.getState().selectedRevisions.new).toEqual([]);
    });

    expect(screen.queryAllByTestId('selected-rev-item')[1]).toBeUndefined();
  });

  it('Should expand on click', async () => {
    const user = userEvent.setup({ delay: null });

    const location = {
      ...window.location,
      search: '?fakedata=true',
    };
    Object.defineProperty(window, 'location', {
      writable: true,
      value: location,
    });
    const urlParams = new URLSearchParams(window.location.search);
    const fakedataParam = urlParams.get('fakedata');
    expect(fakedataParam).toBe('true');

    renderWithRouter(
      <ResultsView
        protocolTheme={protocolTheme}
        toggleColorMode={toggleColorMode}
        title={Strings.metaData.pageTitle.results}
      />,
    );

    const expandButtons = screen.getAllByTestId('expand-revision-button');
    await user.click(expandButtons[0]);
    const expandedContent = await waitFor(() =>
      screen.getAllByTestId('expanded-row-content'),
    );

    expect(expandedContent[0]).toBeVisible();
  });

  it('Should render revision header with link to suite docs', () => {
    const revisionHeader: RevisionsHeader = {
      extra_options: 'e10s fission stylo webgl-ipc webrender',
      framework_id: 1,
      new_repo: 'mozilla-central',
      new_rev: 'a998c42399a8fcea623690bf65bef49de20535b4',
      option_name: 'opt',
      suite: 'allyr',
      test: '3DGraphics-WebGL',
    };

    renderWithRouter(<RevisionHeader header={revisionHeader} />);
    const linkToSuite = screen.queryByLabelText('link to suite documentation');
    expect(linkToSuite).toBeInTheDocument();
  });

  it('Should render revision header without link to suite docs for unsupported framework', () => {
    const revisionHeader: RevisionsHeader = {
      extra_options: 'e10s fission stylo webgl-ipc webrender',
      framework_id: 10,
      new_repo: 'mozilla-central',
      new_rev: 'a998c42399a8fcea623690bf65bef49de20535b4',
      option_name: 'opt',
      suite: 'idle-bg',
      test: '3DGraphics-WebGL',
    };

    renderWithRouter(<RevisionHeader header={revisionHeader} />);
    const linkToSuite = screen.queryByLabelText('link to suite documentation');
    expect(linkToSuite).not.toBeInTheDocument();
  });

  it('Should display Base graph and New graph', async () => {
    const user = userEvent.setup({ delay: null });
    const location = {
      ...window.location,
      search: '?fakedata=true',
    };
    Object.defineProperty(window, 'location', {
      writable: true,
      value: location,
    });
    const urlParams = new URLSearchParams(window.location.search);
    const fakedataParam = urlParams.get('fakedata');
    expect(fakedataParam).toBe('true');

    renderWithRouter(
      <ResultsView
        protocolTheme={protocolTheme}
        toggleColorMode={toggleColorMode}
        title={Strings.metaData.pageTitle.results}
      />,
    );

    const expandButtons = screen.getAllByTestId('expand-revision-button');
    await user.click(expandButtons[0]);
    await waitFor(() => screen.getAllByTestId('expanded-row-content'));

    const MockedBubble = Bubble as jest.Mock;

    const bubbleProps = MockedBubble.mock.calls.map(
      (call) => call[0] as ChartProps,
    );
    expect(bubbleProps[0].data.datasets[0].label).toBe('Base');
    expect(bubbleProps[1].data.datasets[0].label).toBe('New');
  });

  it('Should display tooltip for single graph distrbution', async () => {
    const user = userEvent.setup({ delay: null });

    const location = {
      ...window.location,
      search: '?fakedata=true',
    };
    Object.defineProperty(window, 'location', {
      writable: true,
      value: location,
    });
    const urlParams = new URLSearchParams(window.location.search);
    const fakedataParam = urlParams.get('fakedata');
    expect(fakedataParam).toBe('true');

    renderWithRouter(
      <ResultsView
        protocolTheme={protocolTheme}
        toggleColorMode={toggleColorMode}
        title={Strings.metaData.pageTitle.results}
      />,
    );

    const expandButtons = screen.getAllByTestId('expand-revision-button');
    await user.click(expandButtons[0]);

    const MockedBubble = Bubble as jest.Mock;
    const bubbleProps = MockedBubble.mock.calls.map(
      (call) => call[0] as ChartProps,
    );
    const labelFunction =
      bubbleProps[0].options?.plugins?.tooltip?.callbacks?.label;
    if (!labelFunction) {
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw Error;
    }

    // @ts-expect-error does not affect the test coverage
    // consider fixing it if we change the label function in the future
    const labelResult = labelFunction({ raw: { x: 5, y: 0, r: 10 } });
    expect(labelResult).toBe('5 ms');
  });
});
