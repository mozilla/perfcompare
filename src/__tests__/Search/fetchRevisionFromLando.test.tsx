import fetchMock from '@fetch-mock/jest';

import App, { router } from '../../components/App';
import { Strings } from '../../resources/Strings';
import { render } from '../utils/test-utils';

describe('Lando to commit validating', () => {
  it('Should tell us not all paramaters were provided', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    // Error 1: no newLando=5678
    await router.navigate(
      '/compare-lando-results?baseLando=1234&baseRepo=try&newRepo=try&framework=1',
    );
    render(<App />);
    expect(console.error).toHaveBeenCalledWith(
      new Error(
        'Not all values were supplied please check you provided both baseLando and newLando',
      ),
    );
    expect(console.error).toHaveBeenCalledTimes(1);
    (console.error as jest.Mock).mockClear();
  });

  it('should reject hashes not associated with any commits error 404', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    fetchMock.get(
      'glob:https://api.lando.services.mozilla.com/*',
      ({ url }) => {
        return url.includes('123')
          ? {
              status: 404,
              body: {
                detail: 'A landing job with ID 456789 was not found.',
                status: 404,
                title: 'Landing job not found',
                type: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/404',
              },
            }
          : {
              commit_id: '096aa2c25fb2f031021de8c58baf9c46c052ab2e',
              id: 108,
              status: 'LANDED',
            };
      },
    );
    await router.navigate(
      '/compare-lando-results?baseLando=123&baseRepo=try&newLando=456789&newRepo=try&framework=1',
    );
    render(<App />);
    expect(console.error).toHaveBeenCalledWith(
      new Error('Error when requesting lando: (404) Not Found'),
    );
    expect(console.error).toHaveBeenCalledTimes(1);
    (console.error as jest.Mock).mockClear();
  });

  it('should use the new Lando instance when landoInstance=lando-prod-2025', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    fetchMock.get('glob:https://lando.moz.tools/*', { status: 404 });
    await router.navigate(
      '/compare-lando-results?baseLando=123&baseRepo=try&newLando=456&newRepo=try&framework=1&landoInstance=lando-prod-2025',
    );
    render(<App />);
    expect(console.error).toHaveBeenCalledWith(
      new Error('Error when requesting lando: (404) Not Found'),
    );
    expect(fetchMock.callHistory.called('glob:https://lando.moz.tools/*')).toBe(
      true,
    );
    expect(
      fetchMock.callHistory.called(
        'glob:https://api.lando.services.mozilla.com/*',
      ),
    ).toBe(false);
    (console.error as jest.Mock).mockClear();
  });

  it('should explain when Lando is still creating the try push', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    fetchMock.get(
      'glob:https://api.lando.services.mozilla.com/*',
      ({ url }) => {
        return url.includes('123')
          ? {
              commit_id: null,
              id: 108,
              status: 'SUBMITTED',
            }
          : {
              commit_id: '6331cb86f104e2587160208d8e47d8bef8b38ffc',
              id: 96,
              status: 'LANDED',
            };
      },
    );
    await router.navigate(
      '/compare-lando-results?baseLando=123&baseRepo=try&newLando=456&newRepo=try&framework=1',
    );
    render(<App />);
    expect(console.error).toHaveBeenCalledWith(
      new Error(Strings.errors.lando.pending('123', 'SUBMITTED')),
    );
    expect(console.error).toHaveBeenCalledTimes(1);
    (console.error as jest.Mock).mockClear();
  });

  it('should explain when Lando failed to create the try push', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    fetchMock.get(
      'glob:https://api.lando.services.mozilla.com/*',
      ({ url }) => {
        return url.includes('123')
          ? {
              commit_id: '096aa2c25fb2f031021de8c58baf9c46c052ab2e',
              id: 108,
              status: 'LANDED',
            }
          : {
              commit_id: null,
              error: 'Tree is closed',
              id: 96,
              status: 'FAILED',
            };
      },
    );
    await router.navigate(
      '/compare-lando-results?baseLando=123&baseRepo=try&newLando=456&newRepo=try&framework=1',
    );
    render(<App />);
    expect(console.error).toHaveBeenCalledWith(
      new Error(Strings.errors.lando.failed('456', 'FAILED', 'Tree is closed')),
    );
    expect(console.error).toHaveBeenCalledTimes(1);
    (console.error as jest.Mock).mockClear();
  });

  it('should explain when Lando landed but still has no revision', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    fetchMock.get('glob:https://api.lando.services.mozilla.com/*', {
      commit_id: null,
      id: 108,
      status: 'LANDED',
    });
    await router.navigate(
      '/compare-lando-results?baseLando=123&baseRepo=try&newLando=456&newRepo=try&framework=1',
    );
    render(<App />);
    expect(console.error).toHaveBeenCalledWith(
      new Error(Strings.errors.lando.landedWithoutRevision('123', 'LANDED')),
    );
    expect(console.error).toHaveBeenCalledTimes(1);
    (console.error as jest.Mock).mockClear();
  });

  it('should explain when Treeherder has not ingested the try push yet', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    fetchMock.get(
      'glob:https://api.lando.services.mozilla.com/*',
      ({ url }) => {
        return url.includes('123')
          ? {
              commit_id: '096aa2c25fb2f031021de8c58baf9c46c052ab2e',
              id: 108,
              status: 'LANDED',
            }
          : {
              commit_id: '6331cb86f104e2587160208d8e47d8bef8b38ffc',
              id: 96,
              status: 'LANDED',
            };
      },
    );
    fetchMock.get('glob:https://treeherder.mozilla.org/api/project/*/push/*', {
      results: [],
    });
    await router.navigate(
      '/compare-lando-results?baseLando=123&baseRepo=try&newLando=456&newRepo=try&framework=1',
    );
    render(<App />);
    expect(console.error).toHaveBeenCalledWith(
      new Error(
        Strings.errors.lando.notInTreeherder(
          '123',
          '096aa2c25fb2f031021de8c58baf9c46c052ab2e',
        ),
      ),
    );
    expect(console.error).toHaveBeenCalledTimes(1);
    (console.error as jest.Mock).mockClear();
  });
});
