import { act } from 'react-dom/test-utils';

import SearchComponent from '../../components/Shared/beta/SearchComponent';
import { Strings } from '../../resources/Strings';
import { renderWithRouter, store } from '../utils/setupTests';

const stringsBase = Strings.components.searchDefault.base.collaped.base;

describe('Search View', () => {
  it('renders correctly when there are no results', async () => {
    const baseRepo = store.getState().search.baseRepository;
    renderWithRouter(
      <SearchComponent
        {...stringsBase}
        view='search'
        mode='light'
        base='base'
        repository={baseRepo}
      />,
    );

    expect(document.body).toMatchSnapshot();
    await act(async () => void jest.runOnlyPendingTimers());
  });
});
