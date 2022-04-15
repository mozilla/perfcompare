import store from '../common/store';
import {
  fetchRecentRevisions,
  fetchRevisionByID,
  fetchRevisionsByAuthor,
} from '../thunks/searchThunk';

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

    await store.dispatch(fetchRecentRevisions(repository));

    expect(spyOnDispatch).toHaveBeenCalled();
    expect(spyOnFetch).toHaveBeenCalledTimes(1);
    expect(spyOnFetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/brian/push/',
    );
    expect(store.getState().search.searchResults).toStrictEqual([
      'spam',
      'spam',
      'spam',
      'eggs',
      'spam',
    ]);
  });

  it('should reject promise and update error message fetch returned no results', async () => {
    const spyOnFetch = jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve(
        Promise.resolve({
          json: () => ({
            results: [],
          }),
        }),
      ),
    );
    const spyOnDispatch = jest.spyOn(store, 'dispatch');
    const repository = 'brian';

    const response = await store.dispatch(fetchRecentRevisions(repository));

    expect(spyOnDispatch).toHaveBeenCalled();
    expect(spyOnFetch).toHaveBeenCalledTimes(1);
    expect(spyOnFetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/brian/push/',
    );
    expect(store.getState().search.searchResults).toStrictEqual([]);

    expect(response.payload).toStrictEqual('No results found');
  });

  it('should update error when fetchRecentRevisions returns an error', async () => {
    const spyOnFetch = jest
      .spyOn(global, 'fetch')
      .mockImplementation(() =>
        Promise.reject(
          new Error(
            "You've got two empty 'alves of coconuts and you're bangin' 'em togetha!",
          ),
        ),
      );
    const repository = 'brian';

    await store.dispatch(fetchRecentRevisions(repository));

    expect(spyOnFetch).toHaveBeenCalledTimes(1);
    expect(store.getState().search.errorMessage).toBe(
      "You've got two empty 'alves of coconuts and you're bangin' 'em togetha!",
    );
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

    await store.dispatch(fetchRevisionByID({ repository, search }));

    expect(spyOnDispatch).toHaveBeenCalled();
    expect(spyOnFetch).toHaveBeenCalledTimes(1);
    expect(spyOnFetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/brian/push/?revision=aboycalledbrian',
    );
    expect(store.getState().search.searchResults).toStrictEqual([
      'eggs',
      'spam',
      'spam',
      'eggs',
      'spam',
    ]);
  });

  it('should reject promise and update error message fetch returned no results', async () => {
    const spyOnFetch = jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve(
        Promise.resolve({
          json: () => ({
            results: [],
          }),
        }),
      ),
    );
    const spyOnDispatch = jest.spyOn(store, 'dispatch');
    const repository = 'brian';
    const search = 'aboycalledbrian';

    const response = await store.dispatch(
      fetchRevisionByID({ repository, search }),
    );

    expect(spyOnDispatch).toHaveBeenCalled();
    expect(spyOnFetch).toHaveBeenCalledTimes(1);
    expect(spyOnFetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/brian/push/?revision=aboycalledbrian',
    );
    expect(store.getState().search.searchResults).toStrictEqual([]);
    expect(response.payload).toStrictEqual('No results found');
  });

  it('should update error when fetchRevisionByID returns an error', async () => {
    const spyOnFetch = jest
      .spyOn(global, 'fetch')
      .mockImplementation(() =>
        Promise.reject(
          new Error(
            "You've got two empty 'alves of coconuts and you're bangin' 'em togetha!",
          ),
        ),
      );
    const repository = 'brian';
    const search = 'aboycalledbrian';

    await store.dispatch(fetchRevisionByID({ repository, search }));

    expect(spyOnFetch).toHaveBeenCalledTimes(1);
    expect(store.getState().search.errorMessage).toBe(
      "You've got two empty 'alves of coconuts and you're bangin' 'em togetha!",
    );
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

    await store.dispatch(fetchRevisionsByAuthor({ repository, search }));

    expect(spyOnDispatch).toHaveBeenCalled();
    expect(spyOnFetch).toHaveBeenCalledTimes(1);
    expect(spyOnFetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/brian/push/?author=amancalledbrian',
    );
    expect(store.getState().search.searchResults).toStrictEqual([
      'spam',
      'spam',
      'spam',
      'spam',
      'spam',
    ]);
  });

  it('should reject promise and update error message fetch returned no results', async () => {
    const spyOnFetch = jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve(
        Promise.resolve({
          json: () => ({
            results: [],
          }),
        }),
      ),
    );
    const spyOnDispatch = jest.spyOn(store, 'dispatch');
    const repository = 'brian';
    const search = 'aboycalledbrian';

    const response = await store.dispatch(
      fetchRevisionsByAuthor({ repository, search }),
    );

    expect(spyOnDispatch).toHaveBeenCalled();
    expect(spyOnFetch).toHaveBeenCalledTimes(1);
    expect(spyOnFetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/brian/push/?author=aboycalledbrian',
    );
    expect(store.getState().search.searchResults).toStrictEqual([]);
    expect(response.payload).toStrictEqual('No results found');
  });

  it('should update error when fetchRevisionsByAuthor returns an error', async () => {
    const spyOnFetch = jest
      .spyOn(global, 'fetch')
      .mockImplementation(() =>
        Promise.reject(new Error('Run away! Run away!')),
      );
    const repository = 'brian';
    const search = 'amancalledbrian';

    await store.dispatch(fetchRevisionsByAuthor({ repository, search }));

    expect(spyOnFetch).toHaveBeenCalledTimes(1);
    expect(store.getState().search.errorMessage).toBe('Run away! Run away!');
  });
});
