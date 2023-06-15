import { act } from 'react-dom/test-utils';

import SearchComponent from '../../components/Search/SearchComponent';
import SearchResultsList from '../../components/Search/SearchResultsList';
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

  it('displays selected revisions when user checks a revision', async () => {
    const view = 'search' as 'search' | 'compare-results';
    const mode = 'light' as 'light' | 'dark';
    const searchType = 'base' as InputType;
    const SearchPropsBase = {
      searchType,
      mode,
      view,
      ...stringsBase,
    };

    await act(async () => {
      renderWithRouter(
        <>
          <SearchComponent {...SearchPropsBase} />,
          <SearchResultsList view={view} mode={mode} searchType={searchType} />,
        </>,
      );
    });

    expect(document.body).toMatchSnapshot();
    await act(async () => void jest.runOnlyPendingTimers());
  });
});
