import type { ReactElement } from 'react';

import fetchMock from '@fetch-mock/jest';

import { loader } from '../../components/CompareResults/loader';
import ResultsView from '../../components/CompareResults/ResultsView';
import RevisionSelect from '../../components/CompareResults/RevisionSelect';
import { Strings } from '../../resources/Strings';
import type { CompareResultsItem } from '../../types/state';
import { comparisonResults as secondRevisionResults } from '../utils/fakeRevisions/9d50665254899d8431813bdc04178e6006ce6d59';
import { comparisonResults as thirdRevisionResults } from '../utils/fakeRevisions/a998c42399a8fcea623690bf65bef49de20535b4';
import { comparisonResults as firstRevisionResults } from '../utils/fakeRevisions/bb6a5e451dace3b9c7be42d24c9272738d73e6db';
import {
  fireEvent,
  renderWithRouter,
  screen,
  within,
} from '../utils/test-utils';

const baseRev = '3639b6891b332ea6c4ffea87bb2d1139c38b781d';
const resultsByRevision: Record<string, CompareResultsItem[]> = {
  bb6a5e451dace3b9c7be42d24c9272738d73e6db: firstRevisionResults,
  '9d50665254899d8431813bdc04178e6006ce6d59': secondRevisionResults,
  a998c42399a8fcea623690bf65bef49de20535b4: thirdRevisionResults,
};

function renderWithRoute(component: ReactElement) {
  const params = new URLSearchParams({
    baseRev,
    baseRepo: 'mozilla-central',
    framework: '1',
    test_version: 'student-t',
  });
  for (const newRev of Object.keys(resultsByRevision)) {
    params.append('newRev', newRev);
    params.append('newRepo', 'mozilla-central');
  }
  return renderWithRouter(component, {
    route: '/compare-results/',
    search: `?${params.toString()}`,
    loader,
  });
}

describe('Revision select', () => {
  beforeEach(() => {
    fetchMock.get(
      'begin:https://treeherder.mozilla.org/api/perfcompare/results/',
      ({ url }) =>
        resultsByRevision[new URL(url).searchParams.get('new_revision') ?? ''],
    );
    // The loader requests information about each revision.
    fetchMock.get(
      'begin:https://treeherder.mozilla.org/api/project/',
      ({ url }) => {
        const revision = new URL(url).searchParams.get('revision');
        if (!revision) return { results: [] };
        return {
          results: [
            {
              id: 1,
              revision,
              author: 'johncena@mozilla.com',
              revisions: [
                {
                  result_set_id: 1,
                  repository_id: 1,
                  revision,
                  author: 'johncena@mozilla.com',
                  comments: `Commit message for ${revision}`,
                },
              ],
              revision_count: 1,
              push_timestamp: 1700000000,
              repository_id: 1,
            },
          ],
        };
      },
    );
  });

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
    renderWithRoute(<ResultsView title={Strings.metaData.pageTitle.results} />);
    await screen.findByLabelText('Filter by revision');

    // check to display results for all revisions
    let firstRevisionHeaders = await within(
      await screen.findByTestId('results-table'),
    ).findAllByRole('link', {
      name: /bb6a5e451dac/,
    });
    expect(firstRevisionHeaders).toHaveLength(8);

    let secondRevisionHeaders = await within(
      await screen.findByTestId('results-table'),
    ).findAllByRole('link', {
      name: /9d5066525489/,
    });
    expect(secondRevisionHeaders).toHaveLength(7);

    const thirdRevisionHeaders = await within(
      await screen.findByTestId('results-table'),
    ).findAllByRole('link', {
      name: /a998c42399a8/,
    });
    expect(thirdRevisionHeaders).toHaveLength(7);

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
    firstRevisionHeaders = await within(
      await screen.findByTestId('results-table'),
    ).findAllByText(/bb6a5e451dac/, {
      selector: 'a',
    });
    expect(firstRevisionHeaders).toHaveLength(8);

    expect(
      within(screen.getByTestId('results-table')).queryAllByText(
        /9d5066525489/,
        {
          selector: 'a',
        },
      ),
    ).toStrictEqual([]);

    expect(
      within(screen.getByTestId('results-table')).queryAllByText(
        /a998c42399a8/,
        {
          selector: 'a',
        },
      ),
    ).toStrictEqual([]);

    // Now select the second option 9d5066525489
    fireEvent.mouseDown(selectButton);
    listbox = within(await screen.findByRole('listbox'));
    fireEvent.click(await listbox.findByText('9d5066525489'));
    expect(selectButton).toHaveTextContent('9d5066525489');

    fireEvent.mouseDown(selectButton);

    // check to display results only for revision 9d5066525489
    // findByRole doesn't work anymore because the root element
    // has aria-hidden but we don't know why yet
    secondRevisionHeaders = await within(
      await screen.findByTestId('results-table'),
    ).findAllByText(/9d5066525489/, {
      selector: 'a',
    });
    expect(secondRevisionHeaders).toHaveLength(7);

    expect(secondRevisionHeaders).toHaveLength(7);

    expect(
      within(screen.getByTestId('results-table')).queryAllByText(
        /bb6a5e451dac/,
        {
          selector: 'a',
        },
      ),
    ).toStrictEqual([]);

    expect(
      within(screen.getByTestId('results-table')).queryAllByText(
        /a998c42399a8/,
        {
          selector: 'a',
        },
      ),
    ).toStrictEqual([]);
  });
});
