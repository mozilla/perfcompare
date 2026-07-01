import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from '@fetch-mock/jest';

import SearchInputAndResults from '../../components/Search/SearchInputAndResults';
import { renderWithRouter } from '../utils/test-utils';
import getTestData from '../utils/fixtures';

// Mock the debounce function to execute immediately for predictable testing
jest.mock('../../../utils/simple-debounce', () => ({
  simpleDebounce: (fn: (...args: unknown[]) => unknown) =>
    jest.fn((...args: unknown[]) => fn(...args)),
}));

describe('SearchInputAndResults', () => {
  const mockOnSearchResultsToggle = jest.fn();
  const defaultProps = {
    compact: false,
    inputPlaceholder: 'Search by revision hash, author, or keywords',
    displayedRevisions: [],
    searchType: 'base' as 'base' | 'new',
    repository: 'mozilla-central',
    onSearchResultsToggle: mockOnSearchResultsToggle,
    listItemComponent: 'checkbox' as 'checkbox' | 'radio',
  };

  beforeEach(() => {
    fetchMock.restore();
    mockOnSearchResultsToggle.mockClear();
    // Default mock for fetchRecentRevisions to prevent network errors
    fetchMock.get('begin:https://treeherder.mozilla.org/api/project/', {
      results: [],
    });
    fetchMock.get('begin:https://treeherder.mozilla.org/api/pushes', {
      pushes: [],
    });
  });

  async function typeIntoSearch(text: string) {
    const searchInput = screen.getByRole('combobox', {
      name: defaultProps.inputPlaceholder,
    });
    await userEvent.type(searchInput, text);
    // Wait for debounce to trigger (mocked to be immediate)
    await act(async () => {
      await Promise.resolve();
      await fetchMock.flush();
    });
  }

  it('renders without crashing', () => {
    renderWithRouter(<SearchInputAndResults {...defaultProps} />);
    expect(
      screen.getByRole('combobox', { name: defaultProps.inputPlaceholder }),
    ).toBeInTheDocument();
  });

  it('displays search results when fetching recent revisions', async () => {
    const { testData } = getTestData();
    fetchMock.get(
      'begin:https://treeherder.mozilla.org/api/project/mozilla-central/pushed/?fulltext_search=test',
      {
        pushes: [
          {
            ...testData[0],
            author: 'Test Author',
            revision: 'abcdef1234567890abcdef1234567890abcdef12',
          },
        ],
      },
    );

    renderWithRouter(<SearchInputAndResults {...defaultProps} />);
    await typeIntoSearch('test');

    await waitFor(() =>
      expect(
        screen.getByText('abcdef1234567890abcdef1234567890abcdef12'),
      ).toBeInTheDocument(),
    );
    expect(screen.getByText('Test Author')).toBeInTheDocument();
  });

  it('shows "No results found" when the search returns no revisions', async () => {
    fetchMock.get(
      'begin:https://treeherder.mozilla.org/api/project/mozilla-central/pushed/?search=no_match',
      { pushes: [] },
    );

    renderWithRouter(<SearchInputAndResults {...defaultProps} />);
    await typeIntoSearch('no_match');

    await waitFor(() =>
      expect(screen.getByText('No results found')).toBeInTheDocument(),
    );
  });

  it('prioritizes complete hash matching for 40-character hashes and auto-selects', async () => {
    const completeHash = '0123456789012345678901234567890123456789';
    const { testData } = getTestData();
    const mockRevision = {
      ...testData[0],
      revision: completeHash,
      id: 'mock_id_complete',
    };

    fetchMock.get(
      `begin:https://treeherder.mozilla.org/api/project/mozilla-central/pushed/?hash=${completeHash}`,
      { pushes: [mockRevision] },
    );

    renderWithRouter(<SearchInputAndResults {...defaultProps} />);
    await typeIntoSearch(completeHash);

    await waitFor(() => {
      expect(mockOnSearchResultsToggle).toHaveBeenCalledWith(mockRevision);
    });
  });

  it('auto-selects for partial hashes (4-39 characters)', async () => {
    const partialHash = 'abcde123';
    const { testData } = getTestData();
    const mockRevision = {
      ...testData[0],
      revision: `abcde1234567890abcdef1234567890abcdef12`,
      id: 'mock_id_partial',
    };

    fetchMock.get(
      `begin:https://treeherder.mozilla.org/api/project/mozilla-central/pushed/?hash=${partialHash}`,
      { pushes: [mockRevision] },
    );

    renderWithRouter(<SearchInputAndResults {...defaultProps} />);
    await typeIntoSearch(partialHash);

    await waitFor(() => {
      expect(mockOnSearchResultsToggle).toHaveBeenCalledWith(mockRevision);
    });
  });

  it('does not auto-select if autoSelect is false (default for non-hashes)', async () => {
    const searchTerm = 'some author';
    const { testData } = getTestData();
    const mockRevision = {
      ...testData[0],
      author: searchTerm,
      revision: 'abcdef1234567890abcdef1234567890abcdef12',
      id: 'mock_id_author',
    };

    fetchMock.get(
      `begin:https://treeherder.mozilla.org/api/project/mozilla-central/pushed/?author=${searchTerm}`,
      { pushes: [mockRevision] },
    );

    renderWithRouter(<SearchInputAndResults {...defaultProps} />);
    await typeIntoSearch(searchTerm);

    await waitFor(() => {
      expect(screen.getByText(searchTerm)).toBeInTheDocument(); // Result is displayed
      expect(mockOnSearchResultsToggle).not.toHaveBeenCalled(); // But not auto-selected
    });
  });

  it('does not auto-select if the matched revision is already in displayedRevisions for searchType "new"', async () => {
    const completeHash = '0123456789012345678901234567890123456789';
    const { testData } = getTestData();
    const mockRevision = {
      ...testData[0],
      revision: completeHash,
      id: 'mock_id_complete',
    };

    fetchMock.get(
      `begin:https://treeherder.mozilla.org/api/project/mozilla-central/pushed/?hash=${completeHash}`,
      { pushes: [mockRevision] },
    );

    renderWithRouter(
      <SearchInputAndResults
        {...defaultProps}
        searchType="new"
        displayedRevisions={[mockRevision]} // Already selected
      />,
    );
    await typeIntoSearch(completeHash);

    await waitFor(() => {
      expect(mockOnSearchResultsToggle).not.toHaveBeenCalled();
    });
  });

  it('handles empty search term by fetching recent revisions without filters', async () => {
    const { testData } = getTestData();
    fetchMock.get(
      'begin:https://treeherder.mozilla.org/api/project/mozilla-central/pushed/?limit=50',
      {
        pushes: [
          {
            ...testData[0],
            author: 'Recent Author',
            revision: 'recenthash1234567890abcdef1234567890abcd',
          },
        ],
      },
    );

    renderWithRouter(<SearchInputAndResults {...defaultProps} />);
    await typeIntoSearch(''); // Clear input

    await waitFor(() => {
      expect(screen.getByText('Recent Author')).toBeInTheDocument();
    });
  });

  it('shows a warning for search terms less than 3 characters', async () => {
    renderWithRouter(<SearchInputAndResults {...defaultProps} />);
    await typeIntoSearch('ab');

    await waitFor(() => {
      expect(screen.getByText('Please enter at least 3 characters')).toBeInTheDocument();
    });
    expect(fetchMock.called()).toBe(false); // No API call should be made
  });

  it('uses fulltext search when useFulltextSearch is in URL and input is not a hash', async () => {
    const { testData } = getTestData();
    fetchMock.get(
      'begin:https://treeherder.mozilla.org/api/project/mozilla-central/pushed/?search=fulltext',
      { pushes: [testData[0]] },
    );

    window.history.pushState(
      {},
      'Test title',
      '?useFulltextSearch=true',
    );
    renderWithRouter(<SearchInputAndResults {...defaultProps} />);
    await typeIntoSearch('fulltext');

    await waitFor(() => {
      expect(fetchMock.called(
        'begin:https://treeherder.mozilla.org/api/project/mozilla-central/pushed/?search=fulltext',
      )).toBe(true);
    });
  });

  it('uses hash search even with useFulltextSearch in URL if input is a 40-char hash', async () => {
    const completeHash = '0123456789012345678901234567890123456789';
    const { testData } = getTestData();
    const mockRevision = {
      ...testData[0],
      revision: completeHash,
      id: 'mock_id_complete_ft',
    };

    fetchMock.get(
      `begin:https://treeherder.mozilla.org/api/project/mozilla-central/pushed/?hash=${completeHash}`,
      { pushes: [mockRevision] },
    );

    window.history.pushState(
      {},
      'Test title',
      '?useFulltextSearch=true',
    );
    renderWithRouter(<SearchInputAndResults {...defaultProps} />);
    await typeIntoSearch(completeHash);

    await waitFor(() => {
      expect(fetchMock.called(
        `begin:https://treeherder.mozilla.org/api/project/mozilla-central/pushed/?hash=${completeHash}`,
      )).toBe(true);
    });
    await waitFor(() => {
      expect(mockOnSearchResultsToggle).toHaveBeenCalledWith(mockRevision);
    });
  });

  it('uses hash search even with useFulltextSearch in URL if input is a partial hash', async () => {
    const partialHash = 'partial123';
    const { testData } = getTestData();
    const mockRevision = {
      ...testData[0],
      revision: `${partialHash}4567890abcdef1234567890abcdef12`,
      id: 'mock_id_partial_ft',
    };

    fetchMock.get(
      `begin:https://treeherder.mozilla.org/api/project/mozilla-central/pushed/?hash=${partialHash}`,
      { pushes: [mockRevision] },
    );

    window.history.pushState(
      {},
      'Test title',
      '?useFulltextSearch=true',
    );
    renderWithRouter(<SearchInputAndResults {...defaultProps} />);
    await typeIntoSearch(partialHash);

    await waitFor(() => {
      expect(fetchMock.called(
        `begin:https://treeherder.mozilla.org/api/project/mozilla-central/pushed/?hash=${partialHash}`,
      )).toBe(true);
    });
    await waitFor(() => {
      expect(mockOnSearchResultsToggle).toHaveBeenCalledWith(mockRevision);
    });
  });
});
