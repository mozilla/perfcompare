import { loader } from '../../components/TaskclusterAuth/loader';
import TaskclusterCallback from '../../components/TaskclusterAuth/TaskclusterCallback';
import { getLocationOrigin } from '../../utils/location';
import {
  FetchMockSandbox,
  renderWithRouter,
  screen,
} from '../utils/test-utils';

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

  it('should fetch credentials with token bearer', async () => {
    (window.fetch as FetchMockSandbox).post(
      'begin:https://firefox-ci-tc.services.mozilla.com/login/oauth/token',
      {
        access_token: 'RnVpOGJtdDZTb3FlWW5PVUxVclprQQ==',
        token_type: 'Bearer',
      },
    );

    (window.fetch as FetchMockSandbox).get(
      'begin:https://firefox-ci-tc.services.mozilla.com/login/oauth/credentials',
      {
        expires: '2024-05-20T14:07:40.828Z',
        credentials: {
          clientId:
            'mozilla-auth0/ad|Mozilla-LDAP|aesanu/perfcompare-localhost-3000-client-OCvzh5',
          accessToken: 'jQWJVQdeRceT-YymPwTWagPh2PwJr0RmmZyL1uAfMSWg',
        },
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

    expect(
      await screen.findByText(/Getting Taskcluster credentials/),
    ).toBeInTheDocument();
  });
});
