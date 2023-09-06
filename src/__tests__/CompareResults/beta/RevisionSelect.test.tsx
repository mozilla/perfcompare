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

    // check to display results for all revisions
    let firstRevisionHeaders = await screen.findAllByRole('link', {
      name: /bb6a5e451dac/,
    });
    expect(firstRevisionHeaders.length).toBe(8);

    let secondRevisionHeaders = await screen.findAllByRole('link', {
      name: /9d5066525489/,
    });
    expect(secondRevisionHeaders.length).toBe(7);

    let thirdRevisionHeaders = await screen.findAllByRole('link', {
      name: /a998c42399a8/,
    });
    expect(thirdRevisionHeaders.length).toBe(7);

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

    // check to display results only for revision bb6a5e451dac
    firstRevisionHeaders = await screen.findAllByRole('link', {
      name: /bb6a5e451dac/,
    });
    expect(firstRevisionHeaders.length).toBe(8);

    secondRevisionHeaders = await screen.findAllByRole('link', {
      name: /9d5066525489/,
    });
    expect(secondRevisionHeaders.length).toBe(0);

    thirdRevisionHeaders = await screen.findAllByRole('link', {
      name: /a998c42399a8/,
    });
    expect(thirdRevisionHeaders.length).toBe(0);
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
    let firstRevisionHeaders = await screen.findAllByRole('link', {
      name: /bb6a5e451dac/,
    });
    expect(firstRevisionHeaders.length).toBe(8);

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

    // check to display results only for revision 9d5066525489
    firstRevisionHeaders = await screen.findAllByRole('link', {
      name: /bb6a5e451dac/,
    });
    expect(firstRevisionHeaders.length).toBe(0);

    const secondRevisionHeaders = await screen.findAllByRole('link', {
      name: /9d5066525489/,
    });
    expect(secondRevisionHeaders.length).toBe(7);

    const thirdRevisionHeaders = await screen.findAllByRole('link', {
      name: /a998c42399a8/,
    });
    expect(thirdRevisionHeaders.length).toBe(0);
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
    let firstRevisionHeaders = await screen.findAllByRole('link', {
      name: /bb6a5e451dac/,
    });
    expect(firstRevisionHeaders.length).toBe(8);

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

    // check to display results only for revision a998c42399a8
    firstRevisionHeaders = await screen.findAllByRole('link', {
      name: /bb6a5e451dac/,
    });
    expect(firstRevisionHeaders.length).toBe(0);

    const secondRevisionHeaders = await screen.findAllByRole('link', {
      name: /9d5066525489/,
    });
    expect(secondRevisionHeaders.length).toBe(0);

    const thirdRevisionHeaders = await screen.findAllByRole('link', {
      name: /a998c42399a8/,
    });
    expect(thirdRevisionHeaders.length).toBe(7);
  });
});
