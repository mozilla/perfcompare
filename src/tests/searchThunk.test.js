import store from '../common/store';
import {
  fetchRecentRevisions,
  fetchRevisionByID,
  fetchRevisionsByAuthor,
} from '../thunks/searchThunk';

const unmockedFetch = global.fetch;

beforeAll(() => {
  global.fetch = jest.fn(() => []);
});

afterAll(() => {
  global.fetch = unmockedFetch;
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
});

describe('fetchRecentRevisions', () => {
  it('should call fetch with correct URL', async () => {
    const spyOnFetch = jest.spyOn(global, 'fetch');
    const spyOnDispatch = jest.spyOn(store, 'dispatch');
    const repository = 'brian';
    fetchRecentRevisions(repository);
    expect(spyOnDispatch).toHaveBeenCalledTimes(1);
    expect(spyOnFetch).toHaveBeenCalledTimes(1);
  });
});
