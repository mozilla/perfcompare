import store from '../common/store';
import {
  updateLoadingState,
  updateSearchValue,
  updateSearchResults,
  updateRepository,
} from '../reducers/searchSlice';
import {
  fetchRecentRevisions,
  fetchRevisionByID,
  fetchRevisionsByAuthor,
} from '../thunks/searchThunk';

const unmockedFetch = global.fetch;

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  global.fetch = unmockedFetch;
  store.dispatch(updateLoadingState('idle'));
  store.dispatch(updateSearchValue(''));
  store.dispatch(updateSearchResults([]));
  store.dispatch(updateRepository(''));
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
});

describe('fetchRecentRevisions', () => {
  it('should call fetch with correct URL and update recent revisions', async () => {
    const spyOnFetch = jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve(
        Promise.resolve({
          json: () => ({ results: ['spam', 'spam', 'spam', 'eggs', 'spam'] }),
        }),
      ),
    );
    const spyOnDispatch = jest.spyOn(store, 'dispatch');
    const repository = 'brian';

    // Ensure state has been reset in between tests
    expect(store.getState().search.loading).toBe('idle');

    await store.dispatch(fetchRecentRevisions(repository));

    expect(spyOnDispatch).toHaveBeenCalled();
    expect(spyOnFetch).toHaveBeenCalledTimes(1);
    expect(spyOnFetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/brian/push/',
    );
    expect(store.getState().search.loading).toBe('succeeded');
    expect(store.getState().search.recentRevisions).toStrictEqual([
      'spam',
      'spam',
      'spam',
      'eggs',
      'spam',
    ]);
  });

  it('should update loading state to "failed" when fetch returns an error', async () => {
    const spyOnFetch = jest
      .spyOn(global, 'fetch')
      .mockImplementation(() =>
        Promise.reject(new Error('failed to fetch revisions')),
      );
    const repository = 'brian';

    // Ensure state has been reset in between tests
    expect(store.getState().search.loading).toBe('idle');

    await store.dispatch(fetchRecentRevisions(repository));

    expect(spyOnFetch).toHaveBeenCalledTimes(1);
    expect(store.getState().search.loading).toBe('failed');
  });
});

describe('fetchRevisionByID', () => {
  it('should fetch revision by ID and update search results', async () => {
    const spyOnFetch = jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve(
        Promise.resolve({
          json: () => ({ results: ['eggs', 'spam', 'spam', 'eggs', 'spam'] }),
        }),
      ),
    );
    const spyOnDispatch = jest.spyOn(store, 'dispatch');
    const repository = 'brian';
    const search = 'aboycalledbrian';

    // Ensure state has been reset in between tests
    expect(store.getState().search.loading).toBe('idle');

    await store.dispatch(fetchRevisionByID({ repository, search }));

    expect(spyOnDispatch).toHaveBeenCalled();
    expect(spyOnFetch).toHaveBeenCalledTimes(1);
    expect(spyOnFetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/brian/push/?revision=aboycalledbrian',
    );
    expect(store.getState().search.loading).toBe('succeeded');
    expect(store.getState().search.searchResults).toStrictEqual([
      'eggs',
      'spam',
      'spam',
      'eggs',
      'spam',
    ]);
  });

  it('should update loading state to "failed" when fetch returns an error', async () => {
    const spyOnFetch = jest
      .spyOn(global, 'fetch')
      .mockImplementation(() =>
        Promise.reject(new Error('failed to fetch revisions')),
      );
    const repository = 'brian';
    const search = 'aboycalledbrian';

    // Ensure state has been reset in between tests
    expect(store.getState().search.loading).toBe('idle');

    await store.dispatch(fetchRevisionByID({ repository, search }));

    expect(spyOnFetch).toHaveBeenCalledTimes(1);
    expect(store.getState().search.loading).toBe('failed');
  });
});

describe('fetchRevisionsByAuthor', () => {
  it('should fetch revisions by author and update recent revisions', async () => {
    const spyOnFetch = jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve(
        Promise.resolve({
          json: () => ({ results: ['spam', 'spam', 'spam', 'spam', 'spam'] }),
        }),
      ),
    );
    const spyOnDispatch = jest.spyOn(store, 'dispatch');
    const repository = 'brian';
    const search = 'amancalledbrian';

    // Ensure state has been reset in between tests
    expect(store.getState().search.loading).toBe('idle');

    await store.dispatch(fetchRevisionsByAuthor({ repository, search }));

    expect(spyOnDispatch).toHaveBeenCalled();
    expect(spyOnFetch).toHaveBeenCalledTimes(1);
    expect(spyOnFetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/brian/push/?author=amancalledbrian',
    );
    expect(store.getState().search.loading).toBe('succeeded');
    expect(store.getState().search.searchResults).toStrictEqual([
      'spam',
      'spam',
      'spam',
      'spam',
      'spam',
    ]);
  });

  it('should update loading state to "failed" when fetch returns an error', async () => {
    const spyOnFetch = jest
      .spyOn(global, 'fetch')
      .mockImplementation(() =>
        Promise.reject(new Error('failed to fetch revisions')),
      );
    const repository = 'brian';
    const search = 'amancalledbrian';

    // Ensure state has been reset in between tests
    expect(store.getState().search.loading).toBe('idle');

    await store.dispatch(fetchRevisionsByAuthor({ repository, search }));

    expect(spyOnFetch).toHaveBeenCalledTimes(1);
    expect(store.getState().search.loading).toBe('failed');
  });
});
