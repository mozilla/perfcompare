import ResultsView from '../../../components/CompareResults/beta/ResultsView';
import RevisionSelect from '../../../components/CompareResults/beta/RevisionSelect';
import { Strings } from '../../../resources/Strings';
import useProtocolTheme from '../../../theme/protocolTheme';
import { renderWithRouter } from '../../utils/setupTests';
import { fireEvent, renderHook, screen, within } from '../../utils/test-utils';

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

    let selectButton = await screen.findByRole('button');

    expect(selectButton).toHaveTextContent('All revisions');

    fireEvent.mouseDown(selectButton);

    const listbox = within(await screen.findByRole('listbox'));

    fireEvent.click(await listbox.findByText('bb6a5e451dac'));

    selectButton = await screen.findByRole('button');
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
        title={Strings.metaData.pageTitle.results}
      />,
    );

    let comparisonHeaders = await screen.findAllByTestId(/revision-header/);
    expect(comparisonHeaders[0].textContent).toContain('bb6a5e451dac');

    // there are 8 results for revision bb6a5e451dac
    // next result tabel should be for revision 9d5066525489
    expect(comparisonHeaders[8].textContent).toContain('9d5066525489');

    // change comparison to revision bb6a5e451dac
    const selectRevisionDropdown = within(
      await screen.findByTestId('revision-select'),
    );
    let selectButton = await selectRevisionDropdown.findByRole('button');
    expect(selectButton).toHaveTextContent('All revisions');

    fireEvent.mouseDown(selectButton);

    const listbox = within(await screen.findByRole('listbox'));

    fireEvent.click(await listbox.findByText('bb6a5e451dac'));

    selectButton = await selectRevisionDropdown.findByRole('button');
    expect(selectButton).toHaveTextContent('bb6a5e451dac');

    fireEvent.mouseDown(selectButton);

    // check every revision header to be for revision bb6a5e451dac
    comparisonHeaders = await screen.findAllByTestId(/revision-header/);

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
        title={Strings.metaData.pageTitle.results}
      />,
    );

    // check comparison to be for revision bb6a5e451dac
    let firstRevisionHeader = await screen.findAllByTestId(/revision-header/);
    expect(firstRevisionHeader[0].textContent).toContain('bb6a5e451dac');

    // change comparison to revision 9d5066525489
    const selectRevisionDropdown = within(
      await screen.findByTestId('revision-select'),
    );
    let selectButton = await selectRevisionDropdown.findByRole('button');

    fireEvent.mouseDown(selectButton);

    const listbox = within(await screen.findByRole('listbox'));

    fireEvent.click(await listbox.findByText('9d5066525489'));

    selectButton = await selectRevisionDropdown.findByRole('button');
    expect(selectButton).toHaveTextContent('9d5066525489');

    fireEvent.mouseDown(selectButton);

    // check if first revision header has changed to 9d5066525489
    firstRevisionHeader = await screen.findAllByTestId(/revision-header/);

    expect(firstRevisionHeader[0].textContent).toContain('9d5066525489');
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
        title={Strings.metaData.pageTitle.results}
      />,
    );

    // check comparison to be for revision bb6a5e451dac
    let firstRevisionHeader = await screen.findAllByTestId(/revision-header/);
    expect(firstRevisionHeader[0].textContent).toContain('bb6a5e451dac');

    // change comparison to revision a998c42399a8
    const selectRevisionDropdown = within(
      await screen.findByTestId('revision-select'),
    );
    let selectButton = await selectRevisionDropdown.findByRole('button');

    fireEvent.mouseDown(selectButton);

    const listbox = within(await screen.findByRole('listbox'));

    fireEvent.click(await listbox.findByText('a998c42399a8'));

    selectButton = await selectRevisionDropdown.findByRole('button');
    expect(selectButton).toHaveTextContent('a998c42399a8');

    fireEvent.mouseDown(selectButton);

    // check if first revision header has changed to a998c42399a8
    firstRevisionHeader = await screen.findAllByTestId(/revision-header/);
    expect(firstRevisionHeader[0].textContent).toContain('a998c42399a8');
  });
});
