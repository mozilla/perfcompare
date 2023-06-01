import { act } from 'react-dom/test-utils';

import SearchComponent from '../../components/Shared/SearchComponent';
import { Strings } from '../../resources/Strings';
import { renderWithRouter, store } from '../utils/setupTests';

const stringsBase = Strings.components.searchDefault.base.collapsed.base;

describe('Search View', () => {
  it('renders correctly when there are no results', async () => {
    const search = store.getState().search;
    const mode = 'light' as 'light' | 'dark';
    const repository = search.baseRepository;
    const inputError = search.inputErrorBase;
    const searchResults = search.baseSearchResults;
    const inputHelperText = search.inputHelperText;
    const SearchPropsBase = {
      ...stringsBase,
      view: 'search' as 'search' | 'compare-results',
      mode,
      base: 'base' as 'new' | 'base',
      repository,
      inputError,
      inputHelperText,
      searchResults,
    };
    renderWithRouter(<SearchComponent {...SearchPropsBase} />);

    expect(document.body).toMatchSnapshot();
    await act(async () => void jest.runOnlyPendingTimers());
  });
});
