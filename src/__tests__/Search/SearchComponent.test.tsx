import { act } from 'react-dom/test-utils';

import SearchComponent from '../../components/Shared/SearchComponent';
import { Strings } from '../../resources/Strings';
import { InputType } from '../../types/state';
import { renderWithRouter } from '../utils/setupTests';

const stringsBase = Strings.components.searchDefault.base.collapsed.base;

describe('Search View', () => {
  it('renders correctly when there are no results', async () => {
    const SearchPropsBase = {
      searchType: 'base' as InputType,
      mode: 'light' as 'light' | 'dark',
      view: 'search' as 'search' | 'compare-results',
      ...stringsBase,
    };
    renderWithRouter(<SearchComponent {...SearchPropsBase} />);

    expect(document.body).toMatchSnapshot();
    await act(async () => void jest.runOnlyPendingTimers());
  });
});
