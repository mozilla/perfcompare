import type { ReactElement } from 'react';

import fetchMock from '@fetch-mock/jest';

import { loader } from '../../components/CompareResults/loader';
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
    route: '/compare-results/',
    search: '?fakedata=true',
    loader,
  });
}

describe('Revision select', () => {
  it("Should change 'All revisions' option to bb6a5e451dac", async () => {
    renderWithRoute(<RevisionSelect />);

    expect(await screen.findByTestId('revision-select')).toBeInTheDocument();
    expect(document.body).toMatchSnapshot();

    const selectButton = await screen.findByRole('combobox', {
      name: 'Filter by revision',
    });
    fireEvent.mouseDown(selectButton);

    const listbox = within(await screen.findByRole('listbox'));
    fireEvent.click(await listbox.findByText('bb6a5e451dac'));

    expect(selectButton).toHaveTextContent('bb6a5e451dac');
  });

  it('Should filter results', async () => {
    // The component requests recent revisions at load time.
    fetchMock.get('begin:https://treeherder.mozilla.org/api/project/', {
      results: [],
    });
    renderWithRoute(<ResultsView title={Strings.metaData.pageTitle.results} />);
    await screen.findByLabelText('Filter by revision');

    // check to display results for all revisions
    let firstRevisionHeaders = await screen.findAllByRole('link', {
      name: /bb6a5e451dac/,
    });
    expect(firstRevisionHeaders).toHaveLength(9);

    let secondRevisionHeaders = await screen.findAllByRole('link', {
      name: /9d5066525489/,
    });
    expect(secondRevisionHeaders).toHaveLength(8);

    let thirdRevisionHeaders = await screen.findAllByRole('link', {
      name: /a998c42399a8/,
    });
    expect(thirdRevisionHeaders).toHaveLength(8);

    // change comparison to revision bb6a5e451dac
    const selectButton = await screen.findByRole('combobox', {
      name: 'Filter by revision',
    });
    fireEvent.mouseDown(selectButton);

    let listbox = within(await screen.findByRole('listbox'));
    fireEvent.click(await listbox.findByText('bb6a5e451dac'));
    expect(selectButton).toHaveTextContent('bb6a5e451dac');

    // check to display results only for revision bb6a5e451dac
    // findByRole doesn't work anymore because the root element
    // has aria-hidden but we don't know why yet
    firstRevisionHeaders = await screen.findAllByText(/bb6a5e451dac/, {
      selector: 'a',
    });
    expect(firstRevisionHeaders).toHaveLength(9);

    // Only the Perfherder link for comparison with 9d5066525489 is found
    secondRevisionHeaders = await screen.findAllByText(/9d5066525489/, {
      selector: 'a',
    });
    expect(secondRevisionHeaders).toHaveLength(1);

    // Only the Perfherder link for comparison with a998c42399a8 is found
    thirdRevisionHeaders = await screen.findAllByText(/a998c42399a8/, {
      selector: 'a',
    });
    expect(thirdRevisionHeaders).toHaveLength(1);

    // Now select the second option 9d5066525489
    fireEvent.mouseDown(selectButton);
    listbox = within(await screen.findByRole('listbox'));
    fireEvent.click(await listbox.findByText('9d5066525489'));
    expect(selectButton).toHaveTextContent('9d5066525489');

    fireEvent.mouseDown(selectButton);

    // check to display results only for revision 9d5066525489
    // findByRole doesn't work anymore because the root element
    // has aria-hidden but we don't know why yet
    secondRevisionHeaders = await screen.findAllByText(/9d5066525489/, {
      selector: 'a',
    });
    expect(secondRevisionHeaders).toHaveLength(8);

    // Only the Perfherder link for comparison with bb6a5e451dac is found
    firstRevisionHeaders = await screen.findAllByText(/bb6a5e451dac/, {
      selector: 'a',
    });
    expect(firstRevisionHeaders).toHaveLength(1);

    // Only the Perfherder link for comparison with a998c42399a8 is found
    thirdRevisionHeaders = await screen.findAllByText(/a998c42399a8/, {
      selector: 'a',
    });
    expect(thirdRevisionHeaders).toHaveLength(1);
  });
});
