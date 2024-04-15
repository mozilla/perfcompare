import { loader } from '../../components/TaskclusterAuth/loader';
import TaskclusterCallback from '../../components/TaskclusterAuth/TaskclusterCallback';
import { getLocationOrigin } from '../../utils/location';
import { FetchMockSandbox, renderWithRouter } from '../utils/test-utils';
jest.mock('../../utils/location');
const mockedGetLocationOrigin = getLocationOrigin as jest.Mock;

describe('Taskcluster Callback', () => {
  it('should fetch access token bearer', () => {
    (window.fetch as FetchMockSandbox).post(
      'begin:https://firefox-ci-tc.services.mozilla.com/login/oauth/token',
      {
        access_token: 'RnVpOGJtdDZTb3FlWW5PVUxVclprQQ==',
        token_type: 'Bearer',
      },
    );
    sessionStorage.setItem('requestState', 'OkCrH5isZncYqeJbRDelN');
    sessionStorage.setItem(
      'taskclusterUrl',
      'https://firefox-ci-tc.services.mozilla.com',
    );

    renderWithRouter(<TaskclusterCallback />, {
      route: '/taskcluster-auth',
      search: '?code=dwcygG5HQNaLiRe3RcTCbQ&state=OkCrH5isZncYqeJbRDelN',
      loader,
    });
    mockedGetLocationOrigin.mockImplementation(() => 'http://localhost:3000');

    expect(window.fetch).toHaveBeenCalledTimes(1);
  });
});
