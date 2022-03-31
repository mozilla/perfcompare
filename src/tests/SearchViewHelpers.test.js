import store from '../common/store';
import {
  updateSearchValue,
  updateSearchResults,
  updateRepository,
} from '../reducers/searchSlice';
import SearchViewHelper from '../utils/SearchViewHelper';

const { searchByRevisionOrEmail, handleChangeDropdown, handleChangeSearch } =
  SearchViewHelper;

const unmockedFetch = global.fetch;

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  store.dispatch(updateSearchValue(''));
  store.dispatch(updateSearchResults([]));
  store.dispatch(updateRepository(''));
  global.fetch = unmockedFetch;
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
});

describe('handleChangeDropdown', () => {
  it('should dispatch search/updateRepository with "coconut"', () => {
    const event = { target: { innerText: 'coconut' } };
    const spyOnDispatch = jest.spyOn(store, 'dispatch');
    handleChangeDropdown(event);

    expect(spyOnDispatch).toHaveBeenCalledTimes(2);
    expect(spyOnDispatch).toHaveBeenNthCalledWith(1, {
      payload: 'coconut',
      type: 'search/updateRepository',
    });

    expect(store.getState().search.repository).toBe('coconut');
  });

  it('should call fetch with correct URL', () => {
    const event = { target: { innerText: 'coconut' } };
    handleChangeDropdown(event);

    expect(fetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/coconut/push/',
    );
  });

  it('should call searchByRevisionOrEmail if searchValue is not empty', () => {
    const event = { target: { innerText: 'coconut' } };
    const spy = jest.spyOn(SearchViewHelper, 'searchByRevisionOrEmail');
    store.dispatch({
      type: 'search/updateSearchValue',
      payload: 'spam@spamalot.com',
    });

    handleChangeDropdown(event);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('coconut', 'spam@spamalot.com');
  });
});

describe('handleChangeSearch', () => {
  it('should dispatch search/updateSearchValue with "spam"', () => {
    const event = { target: { value: 'spam' } };
    const spyOnDispatch = jest.spyOn(store, 'dispatch');
    handleChangeSearch(event);

    expect(spyOnDispatch).toHaveBeenCalledTimes(1);
    expect(spyOnDispatch).toHaveBeenNthCalledWith(1, {
      payload: 'spam',
      type: 'search/updateSearchValue',
    });
  });

  it('should output message to select a repository if empty', () => {
    const event = { target: { value: 'spam' } };
    const spyOnLog = jest.spyOn(console, 'log');
    handleChangeSearch(event);

    expect(spyOnLog).toHaveBeenCalled();
  });

  it('should call searchByRevisionOrEmail with if repository is not empty', () => {
    const event = { target: { value: 'spam' } };
    const spy = jest.spyOn(SearchViewHelper, 'searchByRevisionOrEmail');
    const spyOnDispatch = jest.spyOn(store, 'dispatch');

    store.dispatch({ type: 'search/updateRepository', payload: 'coconut' });

    handleChangeSearch(event);

    expect(spyOnDispatch).toHaveBeenCalledTimes(2);
    expect(spyOnDispatch).toHaveBeenNthCalledWith(2, {
      payload: 'spam',
      type: 'search/updateSearchValue',
    });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('coconut', 'spam');
  });

  it('should clear searchResults if input is cleared', () => {
    const event = { target: { value: '' } };
    const spyOnDispatch = jest.spyOn(store, 'dispatch');
    handleChangeSearch(event);
    expect(spyOnDispatch).toHaveBeenCalledTimes(2);
    expect(spyOnDispatch).toHaveBeenNthCalledWith(2, {
      payload: [],
      type: 'search/updateSearchResults',
    });
  });
});

describe('searchByRevisionOrEmail', () => {
  it('should dispatch search/fetchRevisionsByAuthor if searchValue is an email', () => {
    const spyOnDispatch = jest.spyOn(store, 'dispatch');
    searchByRevisionOrEmail('spam', 'coconut@python.com');
    expect(spyOnDispatch).toHaveBeenCalledTimes(1);
  });
  it('should dispatch search/fetchRevisionByID if searchValue is an 40 character hash', () => {
    const spyOnDispatch = jest.spyOn(store, 'dispatch');
    searchByRevisionOrEmail('spam', 'antidisestablishmentarianismcoconutspam1');
    expect(spyOnDispatch).toHaveBeenCalledTimes(1);
  });
  it('should not dispatch actions if search value is neither an email or hash', () => {
    const spyOnDispatch = jest.spyOn(store, 'dispatch');
    searchByRevisionOrEmail('spam', 'coconut');
    searchByRevisionOrEmail('spam', 'coconut@');
    searchByRevisionOrEmail('spam', 'coconut@python');
    searchByRevisionOrEmail('spam', 'iamalmostlongenoughtobeahashbutnotquite');
    expect(spyOnDispatch).toHaveBeenCalledTimes(0);
  });
});
