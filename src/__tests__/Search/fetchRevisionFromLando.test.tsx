import fetchMock from '@fetch-mock/jest';

import App, { router } from '../../components/App';
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

  it('should reject', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    fetchMock.get(
      'glob:https://api.lando.services.mozilla.com/*',
      ({ url }) => {
        return url.includes('123')
          ? {
              commit_id: null,
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
    await router.navigate(
      '/compare-lando-results?baseLando=123&baseRepo=try&newLando=456&newRepo=try&framework=1',
    );
    render(<App />);
    expect(console.error).toHaveBeenCalledWith(
      new Error('The parameter baseRev is missing.'),
    );
    expect(console.error).toHaveBeenCalledTimes(1);
    (console.error as jest.Mock).mockClear();
  });
});
