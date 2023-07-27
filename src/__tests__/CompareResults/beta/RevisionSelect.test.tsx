import ResultsView from '../../../components/CompareResults/beta/ResultsView';
import RevisionSelect from '../../../components/CompareResults/beta/RevisionSelect';
import useProtocolTheme from '../../../theme/protocolTheme';
import { renderWithRouter } from '../../utils/setupTests';
import {
  fireEvent,
  renderHook,
  screen,
  waitFor,
  within,
} from '../../utils/test-utils';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual<typeof import('react-router-dom')>('react-router-dom'),
  useSearchParams: () => [new URLSearchParams({ fakedata: 'true' })],
}));

describe('Revision select', () => {
  const protocolTheme = renderHook(() => useProtocolTheme()).result.current
    .protocolTheme;
  const toggleColorMode = renderHook(() => useProtocolTheme()).result.current
    .toggleColorMode;

  it('Should match snapshot', () => {
    renderWithRouter(<RevisionSelect />);

    expect(screen.getByTestId('revision-select')).toBeInTheDocument();
    expect(document.body).toMatchSnapshot();
  });

  it("Should change 'All revisions' option to bb6a5e451dac", async () => {
    renderWithRouter(<RevisionSelect />);

    let selectButton = await waitFor(() => screen.getByRole('button'));

    expect(selectButton).toHaveTextContent('All revisions');

    fireEvent.mouseDown(selectButton);

    const listbox = within(screen.getByRole('listbox'));

    fireEvent.click(listbox.getByText('bb6a5e451dac'));

    selectButton = await waitFor(() => screen.getByRole('button'));
    expect(selectButton).toHaveTextContent('bb6a5e451dac');
  });

  it('Should render results for bb6a5e451dac', async () => {
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
      />,
    );

    let comparisonHeaders = await waitFor(() =>
      screen.getAllByTestId(/revision-header/),
    );
    expect(comparisonHeaders[0].textContent).toContain('bb6a5e451dac');

    // there are 8 results for revision bb6a5e451dac
    // next result tabel should be for revision 9d5066525489
    expect(comparisonHeaders[8].textContent).toContain('9d5066525489');

    // change comparison to revision bb6a5e451dac
    const selectRevisionDropdown = within(
      screen.getByTestId('revision-select'),
    );
    let selectButton = await waitFor(() =>
      selectRevisionDropdown.getByRole('button'),
    );
    expect(selectButton).toHaveTextContent('All revisions');

    fireEvent.mouseDown(selectButton);

    const listbox = within(screen.getByRole('listbox'));

    fireEvent.click(listbox.getByText('bb6a5e451dac'));

    selectButton = await waitFor(() =>
      selectRevisionDropdown.getByRole('button'),
    );
    expect(selectButton).toHaveTextContent('bb6a5e451dac');

    fireEvent.mouseDown(selectButton);

    // check every revision header to be for revision bb6a5e451dac
    comparisonHeaders = await waitFor(() =>
      screen.getAllByTestId(/revision-header/),
    );

    comparisonHeaders.forEach((resultHeader) =>
      expect(resultHeader.textContent).toContain('bb6a5e451dac'),
    );
  });

  it('Should render results for 9d5066525489', async () => {
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
      />,
    );

    // check comparison to be for revision bb6a5e451dac
    let firstRevisionHeader = await waitFor(
      () => screen.getAllByTestId(/revision-header/)[0],
    );
    expect(firstRevisionHeader.textContent).toContain('bb6a5e451dac');

    // change comparison to revision 9d5066525489
    const selectRevisionDropdown = within(
      screen.getByTestId('revision-select'),
    );
    let selectButton = await waitFor(() =>
      selectRevisionDropdown.getByRole('button'),
    );

    fireEvent.mouseDown(selectButton);

    const listbox = within(screen.getByRole('listbox'));

    fireEvent.click(listbox.getByText('9d5066525489'));

    selectButton = await waitFor(() =>
      selectRevisionDropdown.getByRole('button'),
    );
    expect(selectButton).toHaveTextContent('9d5066525489');

    fireEvent.mouseDown(selectButton);

    // check if first revision header has changed to 9d5066525489
    firstRevisionHeader = await waitFor(
      () => screen.getAllByTestId(/revision-header/)[0],
    );
    expect(firstRevisionHeader.textContent).toContain('9d5066525489');
  });

  it('Should render results for a998c42399a8', async () => {
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
      />,
    );

    // check comparison to be for revision bb6a5e451dac
    let firstRevisionHeader = await waitFor(
      () => screen.getAllByTestId(/revision-header/)[0],
    );
    expect(firstRevisionHeader.textContent).toContain('bb6a5e451dac');

    // change comparison to revision a998c42399a8
    const selectRevisionDropdown = within(
      screen.getByTestId('revision-select'),
    );
    let selectButton = await waitFor(() =>
      selectRevisionDropdown.getByRole('button'),
    );

    fireEvent.mouseDown(selectButton);

    const listbox = within(screen.getByRole('listbox'));

    fireEvent.click(listbox.getByText('a998c42399a8'));

    selectButton = await waitFor(() =>
      selectRevisionDropdown.getByRole('button'),
    );
    expect(selectButton).toHaveTextContent('a998c42399a8');

    fireEvent.mouseDown(selectButton);

    // check if first revision header has changed to a998c42399a8
    firstRevisionHeader = await waitFor(
      () => screen.getAllByTestId(/revision-header/)[0],
    );
    expect(firstRevisionHeader.textContent).toContain('a998c42399a8');
  });
});
