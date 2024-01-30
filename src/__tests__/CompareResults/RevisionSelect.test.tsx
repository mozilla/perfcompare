import type { ReactElement } from 'react';

import ResultsView from '../../components/CompareResults/ResultsView';
import RevisionSelect from '../../components/CompareResults/RevisionSelect';
import { Strings } from '../../resources/Strings';
import {
  fireEvent,
  renderWithRouter,
  screen,
  within,
} from '../utils/test-utils';

function renderWithRoute(component: ReactElement) {
  return renderWithRouter(component, {
    route: '/compare-results/?fakedata=true',
  });
}

describe('Revision select', () => {
  it('Should match snapshot', () => {
    renderWithRoute(<RevisionSelect />);

    expect(screen.getByTestId('revision-select')).toBeInTheDocument();
    expect(document.body).toMatchSnapshot();
  });

  it("Should change 'All revisions' option to bb6a5e451dac", async () => {
    renderWithRoute(<RevisionSelect />);

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

    renderWithRoute(<ResultsView title={Strings.metaData.pageTitle.results} />);

    // check to display results for all revisions
    let firstRevisionHeaders = await screen.findAllByRole('link', {
      name: /bb6a5e451dac/,
    });
    expect(firstRevisionHeaders.length).toBe(8);

    const secondRevisionHeaders = await screen.findAllByRole('link', {
      name: /9d5066525489/,
    });
    expect(secondRevisionHeaders.length).toBe(7);

    const thirdRevisionHeaders = await screen.findAllByRole('link', {
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
    // findByRole doesn't work anymore because the root element
    // has aria-hidden but we don't know why yet
    firstRevisionHeaders = await screen.findAllByText(/bb6a5e451dac/, {
      selector: 'a',
    });
    expect(firstRevisionHeaders.length).toBe(8);

    expect(
      screen.queryAllByText(/9d5066525489/, {
        selector: 'a',
      }),
    ).toStrictEqual([]);

    expect(
      screen.queryAllByText(/a998c42399a8/, {
        selector: 'a',
      }),
    ).toStrictEqual([]);
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

    renderWithRoute(<ResultsView title={Strings.metaData.pageTitle.results} />);

    // check comparison to be for revision bb6a5e451dac
    const firstRevisionHeaders = await screen.findAllByRole('link', {
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
    // findByRole doesn't work anymore because the root element
    // has aria-hidden but we don't know why yet
    const secondRevisionHeaders = await screen.findAllByText(/9d5066525489/, {
      selector: 'a',
    });
    expect(secondRevisionHeaders.length).toBe(7);

    expect(
      screen.queryAllByText(/bb6a5e451dac/, {
        selector: 'a',
      }),
    ).toStrictEqual([]);

    expect(
      screen.queryAllByText(/a998c42399a8/, {
        selector: 'a',
      }),
    ).toStrictEqual([]);
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

    renderWithRoute(<ResultsView title={Strings.metaData.pageTitle.results} />);

    // check comparison to be for revision bb6a5e451dac
    const firstRevisionHeaders = await screen.findAllByRole('link', {
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
    // findByRole doesn't work anymore because the root element
    // has aria-hidden but we don't know why yet
    const thirdRevisionHeaders = await screen.findAllByText(/a998c42399a8/, {
      selector: 'a',
    });
    expect(thirdRevisionHeaders.length).toBe(7);

    expect(
      screen.queryAllByText(/9d5066525489/, {
        selector: 'a',
      }),
    ).toStrictEqual([]);

    expect(
      screen.queryAllByText(/bb6a5e451dac/, {
        selector: 'a',
      }),
    ).toStrictEqual([]);
  });
});
