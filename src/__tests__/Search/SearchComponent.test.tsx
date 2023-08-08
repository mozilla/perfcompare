import { act } from 'react-dom/test-utils';

import SearchComponent from '../../components/Search/SearchComponent';
import { Strings } from '../../resources/Strings';
import { InputType, ThemeMode } from '../../types/state';
import { renderWithRouter } from '../utils/setupTests';

const stringsBase = Strings.components.searchDefault.base.collapsed.base;

describe('Search View', () => {
  it('renders correctly when there are no results', async () => {
    const SearchPropsBase = {
      searchType: 'base' as InputType,
      mode: 'light' as ThemeMode,
      view: 'search' as 'search' | 'compare-results',
      isWarning: false,
      ...stringsBase,
    };
    renderWithRouter(<SearchComponent {...SearchPropsBase} />);

    expect(document.body).toMatchSnapshot();
    await act(async () => void jest.runOnlyPendingTimers());
  });
});
