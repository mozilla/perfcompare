import fetchMock from '@fetch-mock/jest';
import userEvent from '@testing-library/user-event';

import SearchInputAndResults from '../../components/Search/SearchInputAndResults';
import getTestData from '../utils/fixtures';
import { screen, render } from '../utils/test-utils';

describe('SearchInputAndResults - Auto-select full hash', () => {
  const mockOnToggle = jest.fn();
  const { testData } = getTestData();
  const fullHash = testData[7].revision;

  beforeEach(() => {
    mockOnToggle.mockClear();
  });

  it('should auto-select when pasting a full hash for base revision', async () => {
    fetchMock.get(
      `glob:https://treeherder.mozilla.org/api/project/try/push/*`,
      { results: testData },
    );

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(
      <SearchInputAndResults
        compact={false}
        inputPlaceholder='Search base'
        displayedRevisions={[]}
        searchType='base'
        repository='try'
        onSearchResultsToggle={mockOnToggle}
        listItemComponent='radio'
      />,
    );

    const input = screen.getByRole('textbox');
    await user.type(input, fullHash);

    // Assert auto-select happened
    expect(mockOnToggle).toHaveBeenCalledWith(testData[7]);
    expect(input).toHaveValue(''); // Input cleared
  });

  it('should auto-select when pasting a full hash for new revision (not already selected)', async () => {
    fetchMock.get(
      `glob:https://treeherder.mozilla.org/api/project/try/push/*`,
      { results: testData },
    );

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(
      <SearchInputAndResults
        compact={false}
        inputPlaceholder='Search new'
        displayedRevisions={[]} // Not selected yet
        searchType='new'
        repository='try'
        onSearchResultsToggle={mockOnToggle}
        listItemComponent='checkbox'
      />,
    );

    const input = screen.getByRole('textbox');
    await user.type(input, fullHash);

    expect(mockOnToggle).toHaveBeenCalledWith(testData[7]);
    expect(input).toHaveValue('');
  });

  it('should not auto-select if full hash is already selected for new revision', async () => {
    fetchMock.get(
      `glob:https://treeherder.mozilla.org/api/project/try/push/*`,
      { results: testData },
    );

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(
      <SearchInputAndResults
        compact={false}
        inputPlaceholder='Search new'
        displayedRevisions={[testData[7]]} // Already selected
        searchType='new'
        repository='try'
        onSearchResultsToggle={mockOnToggle}
        listItemComponent='checkbox'
      />,
    );

    const input = screen.getByRole('textbox');
    await user.type(input, fullHash);

    expect(mockOnToggle).not.toHaveBeenCalled(); // No toggle
    expect(input).toHaveValue(''); // Still cleared
  });

  it('should show dropdown for partial hash (no auto-select)', async () => {
    fetchMock.get(
      `glob:https://treeherder.mozilla.org/api/project/try/push/*`,
      { results: testData },
    );

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(
      <SearchInputAndResults
        compact={false}
        inputPlaceholder='Search base'
        displayedRevisions={[]}
        searchType='base'
        repository='try'
        onSearchResultsToggle={mockOnToggle}
        listItemComponent='radio'
      />,
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'coconut'); // Partial hash

    expect(mockOnToggle).not.toHaveBeenCalled();
    // Dropdown should appear with results
    await screen.findByText(/no arms left/); // From testData
  });
});
