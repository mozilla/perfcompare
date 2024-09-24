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
  function setup({ inputState }: { inputState: string }) {
    // Make window.close a noop so that the component can be rendered after the
    // authentication process.
    jest.spyOn(window, 'close').mockImplementation(() => {});

    sessionStorage.setItem('requestState', inputState);
    sessionStorage.setItem(
      'taskclusterUrl',
      'https://firefox-ci-tc.services.mozilla.com',
    );

    mockedGetLocationOrigin.mockImplementation(() => 'http://localhost:3000');
  }

  it('should fetch credentials with token bearer', async () => {
    const inputCode = 'dwcygG5HQNaLiRe3RcTCbQ';
    const inputState = 'OkCrH5isZncYqeJbRDelN';
    const returnedBearerToken = 'RnVpOGJtdDZTb3FlWW5PVUxVclprQQ==';
    const returnedUserToken = 'jQWJVQdeRceT-YymPwTWagPh2PwJr0RmmZyL1uAfMSWg';
    const returnedClientId =
      'mozilla-auth0/ad|Mozilla-LDAP|ldapuser/perfcompare-localhost-3000-client-OCvzh5';

    setup({ inputState });

    (window.fetch as FetchMockSandbox).post(
      'https://firefox-ci-tc.services.mozilla.com/login/oauth/token',
      {
        access_token: returnedBearerToken,
        token_type: 'Bearer',
      },
    );

    (window.fetch as FetchMockSandbox).get(
      'begin:https://firefox-ci-tc.services.mozilla.com/login/oauth/credentials',
      {
        expires: '2024-05-20T14:07:40.828Z',
        credentials: {
          clientId: returnedClientId,
          accessToken: returnedUserToken,
        },
      },
    );
    renderWithRouter(<TaskclusterCallback />, {
      route: '/taskcluster-auth',
      search: `?code=${inputCode}&state=${inputState}`,
      loader,
    });

    expect(
      await screen.findByText(/Credentials were found/),
    ).toBeInTheDocument();

    expect(window.fetch).toHaveBeenCalledWith(
      'https://firefox-ci-tc.services.mozilla.com/login/oauth/token',
      {
        method: 'POST',
        body: expect.any(URLSearchParams) as URLSearchParams,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
    const requestBody = Object.fromEntries(
      (window.fetch as jest.Mock).mock.calls[0][1].body as URLSearchParams,
    );

    expect(requestBody).toEqual({
      client_id: 'perfcompare-localhost-3000-client',
      code: inputCode,
      grant_type: 'authorization_code',
      redirect_uri: 'http://localhost/taskcluster-auth',
    });

    expect(window.fetch).toHaveBeenLastCalledWith(
      'https://firefox-ci-tc.services.mozilla.com/login/oauth/credentials',
      {
        headers: {
          Authorization: `Bearer ${returnedBearerToken}`,
          'Content-Type': 'aplication/json',
        },
      },
    );

    expect(localStorage.userTokens).toBe(
      `{"https://firefox-ci-tc.services.mozilla.com":{"access_token":"${returnedBearerToken}","token_type":"Bearer"}}`,
    );

    expect(localStorage.userCredentials).toBe(
      `{"https://firefox-ci-tc.services.mozilla.com":{"expires":"2024-05-20T14:07:40.828Z","credentials":{"clientId":"${returnedClientId}","accessToken":"${returnedUserToken}"}}}`,
    );

    expect(window.close).toHaveBeenCalled();
  });
});
