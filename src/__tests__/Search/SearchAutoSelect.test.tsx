import fetchMock from '@fetch-mock/jest';
import userEvent from '@testing-library/user-event';

import { loader } from '../../components/Search/loader';
import SearchView from '../../components/Search/SearchView';
import { Strings } from '../../resources/Strings';
import { screen, renderWithRouter } from '../utils/test-utils';

async function renderSearchViewComponent() {
  renderWithRouter(<SearchView title={Strings.metaData.pageTitle.search} />, {
    loader,
  });
  const title = 'Compare with a base';
  await screen.findByRole('heading', { name: title });
}

describe('Hash Auto-selection', () => {
  beforeEach(() => {
    // fetchMock.reset();
  });

  it('auto-selects partial hash', async () => {
    expect.hasAssertions();
    const mockHash = 'abcdef123456';
    const mockResult = {
      id: 1,
      revision: mockHash,
      author: 'Test Author',
      desc: 'Test Description',
      push_timestamp: 1715694240,
      repository_id: 4,
      revisions: [
        {
          comments: 'Test Comments',
        },
      ],
    };

    fetchMock.get('glob:https://treeherder.mozilla.org/api/project/*/push/*', {
      results: [mockResult],
    });

    const user = userEvent.setup({ delay: null });
    await renderSearchViewComponent();

    const placeholder =
      Strings.components.searchDefault.base.collapsed.base.inputPlaceholder;
    const searchInputs = screen.getAllByPlaceholderText(placeholder);
    const searchInput = searchInputs[1]; // Base search input

    await user.click(searchInput);
    await user.keyboard(mockHash);

    // Wait for the results to be fetched and displayed
    await screen.findAllByText(mockHash);

    const selectedHash = await screen.findAllByText(mockHash.slice(0, 12)); // Selected items use truncated hash
    expect(selectedHash.length).toBeGreaterThan(0);
  });

  it('auto-selects full hash and keeps dropdown open', async () => {
    expect.hasAssertions();
    const fullHash = 'a'.repeat(40);
    const mockResult = {
      id: 2,
      revision: fullHash,
      author: 'Test Author',
      desc: 'Test Description',
      push_timestamp: 1715694240,
      repository: 'try',
      repository_id: 4,
      revisions: [
        {
          comments: 'Test Comments',
        },
      ],
    };

    fetchMock.get('glob:https://treeherder.mozilla.org/api/project/*/push/*', {
      results: [mockResult],
    });

    const user = userEvent.setup({ delay: null });
    await renderSearchViewComponent();

    const placeholder =
      Strings.components.searchDefault.base.collapsed.base.inputPlaceholder;
    const searchInputs = screen.getAllByPlaceholderText(placeholder);
    const searchInput = searchInputs[1]; // Base search input

    await user.click(searchInput);
    await user.paste(fullHash);

    // Wait for the result to be auto-selected
    await screen.findAllByText(fullHash.slice(0, 12));

    // Verify dropdown is open by checking for the full hash in the options
    const options = await screen.findAllByTestId('autocomplete-option');
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent(fullHash.slice(0, 12));
  });

  it('opens dropdown when a selected revision is removed', async () => {
    expect.hasAssertions();
    const mockHash = 'abcdef123456';
    const mockResult = {
      id: 3,
      revision: mockHash,
      author: 'Test Author',
      desc: 'Test Description',
      push_timestamp: 1715694240,
      repository: 'try',
      repository_id: 4,
      revisions: [
        {
          comments: 'Test Comments',
        },
      ],
    };

    fetchMock.get('glob:https://treeherder.mozilla.org/api/project/*/push/*', {
      results: [mockResult],
    });

    const user = userEvent.setup({ delay: null });
    await renderSearchViewComponent();

    const placeholder =
      Strings.components.searchDefault.base.collapsed.base.inputPlaceholder;
    const searchInputs = screen.getAllByPlaceholderText(placeholder);
    const searchInput = searchInputs[1];

    await user.type(searchInput, mockHash);
    await screen.findAllByText(mockHash.slice(0, 12));

    // Let's remove the revision
    const removeButton = screen.getByTestId('close-icon');
    await user.click(removeButton);

    // Verify dropdown is open
    const options = await screen.findAllByTestId('autocomplete-option');
    expect(options.length).toBeGreaterThan(0);
  });
});