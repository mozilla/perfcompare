/* eslint-disable jest/no-disabled-tests */
import type { ReactElement } from 'react';

import userEvent from '@testing-library/user-event';
import { Bubble, ChartProps, Line } from 'react-chartjs-2';

import ResultsView from '../../components/CompareResults/ResultsView';
import RevisionHeader from '../../components/CompareResults/RevisionHeader';
import { setSelectedRevisions } from '../../reducers/SelectedRevisionsSlice';
import { Strings } from '../../resources/Strings';
import { RevisionsHeader } from '../../types/state';
import getTestData from '../utils/fixtures';
import { store } from '../utils/setupTests';
import { renderWithRouter, screen, act } from '../utils/test-utils';

function renderWithRoute(component: ReactElement) {
  return renderWithRouter(component, {
    route: '/compare-results/?fakedata=true',
  });
}

describe('Results View', () => {
  it('Should match snapshot', async () => {
    renderWithRoute(<ResultsView title={Strings.metaData.pageTitle.results} />);
    expect(await screen.findByRole('table')).toMatchSnapshot();
  });

  it('Should render the Compare with a Base component', () => {
    renderWithRoute(<ResultsView title={Strings.metaData.pageTitle.results} />);

    expect(screen.getByText('Compare with a base')).toBeInTheDocument();
  });

  //////EDIT MODE START /////

  it('RESULTS: shows dropdown and input when edit button in clicked', async () => {
    renderWithRouter(<ResultsView title='Results' />);

    const user = userEvent.setup({ delay: null });
    const { testData } = getTestData();
    const selectedRevs = testData.slice(0, 2);

    act(() => {
      store.dispatch(setSelectedRevisions({ selectedRevisions: selectedRevs }));
    });

    const baseDropdown = document.querySelector(
      '.compare-results-base-dropdown',
    );

    expect(baseDropdown).not.toBeInTheDocument();

    const editButton = document.querySelector(
      '.edit-button-base',
    ) as HTMLElement;

    await act(async () => {
      await user.click(editButton);
    });

    expect(document.body).toMatchSnapshot();
    expect(screen.getByTestId('dropdown-select-base')).toBeInTheDocument();
    expect(screen.getAllByRole('textbox')[0]).toBeInTheDocument();
    const hiddenEditButton = document.querySelector(
      '.hide-edit-btn',
    ) as HTMLElement;

    expect(hiddenEditButton).not.toBeInTheDocument();
  });

  it('RESULTS: clicking the cancel button hides input and dropdown', async () => {
    renderWithRouter(<ResultsView title='Results' />);

    const user = userEvent.setup({ delay: null });
    const { testData } = getTestData();
    const selectedRevs = testData.slice(0, 2);

    act(() => {
      store.dispatch(setSelectedRevisions({ selectedRevisions: selectedRevs }));
    });

    const baseDropdown = document.querySelector(
      '.compare-results-base-dropdown',
    );
    expect(baseDropdown).not.toBeInTheDocument();
    const editButton = document.querySelector(
      '.edit-button-base',
    ) as HTMLElement;

    await act(async () => {
      await user.click(editButton);
    });

    const cancelButton = document.querySelector(
      '.cancel-button',
    ) as HTMLElement;

    expect(document.body).toMatchSnapshot();
    expect(screen.getByTestId('dropdown-select-base')).toBeInTheDocument();
    expect(screen.getAllByRole('textbox')[0]).toBeInTheDocument();

    await act(async () => {
      await user.click(cancelButton);
    });

    const container = document.querySelector(
      '.base-search-container',
    ) as HTMLElement;
    expect(container).not.toBeInTheDocument();
  });

  it('RESULTS: clicking the save button hides input and dropdown', async () => {
    renderWithRouter(<ResultsView title='Results' />);

    const user = userEvent.setup({ delay: null });
    const { testData } = getTestData();
    const selectedRevs = testData.slice(0, 2);

    await act(async () => {
      store.dispatch(setSelectedRevisions({ selectedRevisions: selectedRevs }));
    });

    const baseDropdown = document.querySelector(
      '.compare-results-base-dropdown',
    );
    const editButtonBase = document.querySelector(
      '.edit-button-base',
    ) as HTMLElement;
    expect(baseDropdown).not.toBeInTheDocument();

    await act(async () => {
      await user.click(editButtonBase);
    });

    const saveButtonBase = document.querySelector(
      '.save-button-base',
    ) as HTMLElement;

    expect(document.body).toMatchSnapshot();
    expect(screen.getByTestId('dropdown-select-base')).toBeInTheDocument();
    expect(screen.getAllByRole('textbox')[0]).toBeInTheDocument();

    await act(async () => {
      await user.click(saveButtonBase);
    });

    const container = document.querySelector(
      '.base-search-container',
    ) as HTMLElement;
    expect(container).not.toBeInTheDocument();

    //CHECK NEW SAVE BUTTON ACTION
    const editButtonNew = document.querySelector(
      '.edit-button-new',
    ) as HTMLElement;

    await act(async () => {
      await user.click(editButtonNew);
    });

    expect(screen.getByTestId('dropdown-select-new')).toBeInTheDocument();
    expect(screen.getAllByRole('textbox')[0]).toBeInTheDocument();

    const saveButtonNew = document.querySelector(
      '.save-button-new',
    ) as HTMLElement;

    await act(async () => {
      await user.click(saveButtonNew);
    });

    expect(container).not.toBeInTheDocument();
  });

  it.skip('Should render the selected revisions', async () => {
    const { testData } = getTestData();
    renderWithRoute(<ResultsView title={Strings.metaData.pageTitle.results} />);

    const selectedRevisions = testData.slice(0, 5);
    await act(async () => {
      store.dispatch(
        setSelectedRevisions({ selectedRevisions: selectedRevisions }),
      );

      const user = userEvent.setup({ delay: null });
      const { testData } = getTestData();
      const selectedRevs = testData.slice(0, 2);

  it('should render a home link', async () => {
    const { testData } = getTestData();
    const selectedRevisions = testData.slice(0, 2);
    await act(async () => {
      store.dispatch(
        setSelectedRevisions({ selectedRevisions: selectedRevisions }),
      );

      expect(baseDropdown).not.toBeInTheDocument();

      const editButton = document.querySelector(
        '.edit-button-base',
      ) as HTMLElement;

      await act(async () => {
        await user.click(editButton);
      });

      expect(document.body).toMatchSnapshot();
      expect(screen.getByTestId('dropdown-select-base')).toBeInTheDocument();
      expect(screen.getAllByRole('textbox')[0]).toBeInTheDocument();
      const hiddenEditButton = document.querySelector(
        '.hide-edit-btn',
      ) as HTMLElement;

      expect(hiddenEditButton).not.toBeInTheDocument();

      await act(async () => void jest.runOnlyPendingTimers());
    });

    renderWithRoute(<ResultsView title={Strings.metaData.pageTitle.results} />);
    const link = screen.getByLabelText(/link to home/i);
    expect(link).toBeInTheDocument();
  });

  it('should remove the selected base revision once X button is clicked', async () => {
    const { testData } = getTestData();

    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    const selectedRevisions = testData.slice(0, 2);
    await act(async () => {
      store.dispatch(
        setSelectedRevisions({ selectedRevisions: selectedRevisions }),
      );

    renderWithRoute(<ResultsView title={Strings.metaData.pageTitle.results} />);

      act(() => {
        store.dispatch(
          setSelectedRevisions({ selectedRevisions: selectedRevs }),
        );
      });

    const closeIcon = screen.getAllByTestId('close-icon')[0];
    expect(closeIcon).toBeInTheDocument();
    expect(screen.getAllByTestId('selected-rev-item')[1]).toBeInTheDocument();

    await user.click(closeButton[0]);

    expect(screen.queryAllByTestId('selected-rev-item')[1]).toBeUndefined();
  });

  it.skip('should remove the selected new revision once X button is clicked', async () => {
    const { testData } = getTestData();

    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    const selectedRevisions = testData.slice(0, 2);
    await act(async () => {
      store.dispatch(
        setSelectedRevisions({ selectedRevisions: selectedRevisions }),
      );
      expect(baseDropdown).not.toBeInTheDocument();
      const editButton = document.querySelector(
        '.edit-button-base',
      ) as HTMLElement;

      await act(async () => {
        await user.click(editButton);
      });

      const cancelButton = document.querySelector(
        '.cancel-button',
      ) as HTMLElement;

      expect(document.body).toMatchSnapshot();
      expect(screen.getByTestId('dropdown-select-base')).toBeInTheDocument();
      expect(screen.getAllByRole('textbox')[0]).toBeInTheDocument();

      await act(async () => {
        await user.click(cancelButton);
      });

      const container = document.querySelector(
        '.base-search-container',
      ) as HTMLElement;
      expect(container).not.toBeInTheDocument();

      await act(async () => void jest.runOnlyPendingTimers());
    });

    renderWithRoute(<ResultsView title={Strings.metaData.pageTitle.results} />);

      const user = userEvent.setup({ delay: null });
      const { testData } = getTestData();
      const selectedRevs = testData.slice(0, 2);

      await act(async () => {
        store.dispatch(
          setSelectedRevisions({ selectedRevisions: selectedRevs }),
        );
      });

      const baseDropdown = document.querySelector(
        '.compare-results-base-dropdown',
      );
      const editButtonBase = document.querySelector(
        '.edit-button-base',
      ) as HTMLElement;
      expect(baseDropdown).not.toBeInTheDocument();

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

    renderWithRoute(<ResultsView title={Strings.metaData.pageTitle.results} />);

    const expandButtons = await screen.findAllByTestId(
      'expand-revision-button',
    );
    await user.click(expandButtons[0]);
    const expandedContent = await screen.findAllByTestId(
      'expanded-row-content',
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

    renderWithRoute(<RevisionHeader header={revisionHeader} />);
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

    renderWithRoute(<RevisionHeader header={revisionHeader} />);
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

    renderWithRoute(<ResultsView title={Strings.metaData.pageTitle.results} />);

    const expandButtons = await screen.findAllByTestId(
      'expand-revision-button',
    );
    await user.click(expandButtons[0]);
    await screen.findAllByTestId('expanded-row-content');

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

    renderWithRoute(<ResultsView title={Strings.metaData.pageTitle.results} />);

    const expandButtons = await screen.findAllByTestId(
      'expand-revision-button',
    );
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

  it('should display common graph distribution for Base and New', async () => {
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

    renderWithRoute(<ResultsView title={Strings.metaData.pageTitle.results} />);

    const expandButtons = await screen.findAllByTestId(
      'expand-revision-button',
    );
    await user.click(expandButtons[0]);
    await screen.findAllByTestId('expanded-row-content');

    const MockedLine = Line as jest.Mock;
    const lineProps = MockedLine.mock.calls.map(
      (call) => call[0] as ChartProps,
    );
    const graphTitle = lineProps[0].options?.plugins?.title?.text;

    if (!graphTitle) {
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw Error;
    }
    expect(graphTitle).toBe('Runs Density Distribution');
  });

  it('should make blobUrl available when "Download JSON" button is clicked', async () => {
    const user = userEvent.setup({ delay: null });

    const createObjectURLMock = jest.fn().mockReturnValue('blob:');
    global.URL.createObjectURL = createObjectURLMock;
    const revokeObjectURLMock = jest.fn();
    global.URL.revokeObjectURL = revokeObjectURLMock;
    // Render the component

    renderWithRouter(
      <ResultsView title={Strings.metaData.pageTitle.results} />,
    );
    const button = await screen.findByText('Download JSON');
    await user.click(button);

    expect(createObjectURLMock).toHaveBeenCalled();
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:');
  });
});
