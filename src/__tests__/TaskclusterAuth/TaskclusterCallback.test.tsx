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
  it('should fetch credentials with token bearer', async () => {
    // Make window.close a noop so that the component can be rendered after the
    // authentication process.
    jest.spyOn(window, 'close').mockImplementation(() => {});
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
            'mozilla-auth0/ad|Mozilla-LDAP|ldapuser/perfcompare-localhost-3000-client-OCvzh5',
          accessToken: 'jQWJVQdeRceT-YymPwTWagPh2PwJr0RmmZyL1uAfMSWg',
        },
      },
    );
    sessionStorage.setItem('requestState', 'OkCrH5isZncYqeJbRDelN');
    sessionStorage.setItem(
      'taskclusterUrl',
      'https://firefox-ci-tc.services.mozilla.com',
    );

    mockedGetLocationOrigin.mockImplementation(() => 'http://localhost:3000');

    renderWithRouter(<TaskclusterCallback />, {
      route: '/taskcluster-auth',
      search: '?code=dwcygG5HQNaLiRe3RcTCbQ&state=OkCrH5isZncYqeJbRDelN',
      loader,
    });

    expect(
      await screen.findByText(/Credentials were found/),
    ).toBeInTheDocument();

    expect(window.fetch).toHaveBeenCalledWith(
      'https://firefox-ci-tc.services.mozilla.com/login/oauth/token',
      expect.objectContaining({
        method: 'POST',
      }),
    );
    expect(window.fetch).toHaveBeenLastCalledWith(
      'https://firefox-ci-tc.services.mozilla.com/login/oauth/credentials',
      {
        headers: {
          Authorization: 'Bearer RnVpOGJtdDZTb3FlWW5PVUxVclprQQ==',
          'Content-Type': 'aplication/json',
        },
      },
    );

    expect(localStorage.userTokens).toBe(
      '{"https://firefox-ci-tc.services.mozilla.com":{"access_token":"RnVpOGJtdDZTb3FlWW5PVUxVclprQQ==","token_type":"Bearer"}}',
    );

    expect(localStorage.userCredentials).toBe(
      '{"https://firefox-ci-tc.services.mozilla.com":{"expires":"2024-05-20T14:07:40.828Z","credentials":{"clientId":"mozilla-auth0/ad|Mozilla-LDAP|ldapuser/perfcompare-localhost-3000-client-OCvzh5","accessToken":"jQWJVQdeRceT-YymPwTWagPh2PwJr0RmmZyL1uAfMSWg"}}}',
    );

    expect(window.close).toHaveBeenCalled();
  });
});
