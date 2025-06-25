import fetchMock from '@fetch-mock/jest';

import { loader } from '../../components/TaskclusterAuth/loader';
import TaskclusterCallback from '../../components/TaskclusterAuth/TaskclusterCallback';
import { getLocationOrigin } from '../../utils/location';
import { renderWithRouter, screen } from '../utils/test-utils';

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

    fetchMock.post(
      'https://firefox-ci-tc.services.mozilla.com/login/oauth/token',
      {
        access_token: returnedBearerToken,
        token_type: 'Bearer',
      },
    );

    fetchMock.get(
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

    expect(window.fetch).toHaveFetched(
      'https://firefox-ci-tc.services.mozilla.com/login/oauth/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    const tokenCall = fetchMock.callHistory.lastCall(
      'https://firefox-ci-tc.services.mozilla.com/login/oauth/token',
    );
    const body = tokenCall?.options.body;
    if (!(body instanceof URLSearchParams)) {
      throw new Error(
        'Unexpected body passed to the endpoint /login/oauth/token',
      );
    }
    const requestBody = Object.fromEntries(body);
    expect(requestBody).toEqual({
      client_id: 'perfcompare-localhost-3000-client',
      code: inputCode,
      grant_type: 'authorization_code',
      redirect_uri: 'http://localhost/taskcluster-auth',
    });

    expect(window.fetch).toHaveLastFetched(
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

  it('should show a spinner while waiting for the credentials', async () => {
    const inputCode = 'RANDOM_CODE';
    const inputState = 'RANDOM_STATE';
    setup({ inputState });

    const neverResolvedPromise = new Promise(() => {});

    fetchMock.post(
      'https://firefox-ci-tc.services.mozilla.com/login/oauth/token',
      neverResolvedPromise,
    );

    fetchMock.get(
      'begin:https://firefox-ci-tc.services.mozilla.com/login/oauth/credentials',
      neverResolvedPromise,
    );
    renderWithRouter(<TaskclusterCallback />, {
      route: '/taskcluster-auth',
      search: `?code=${inputCode}&state=${inputState}`,
      loader,
    });

    expect(
      await screen.findByText(/Retrieving Taskcluster credentials.../),
    ).toBeInTheDocument();
    expect(document.body).toMatchSnapshot();
  });

  it('should show an error if it fails to fetch', async () => {
    // Because this test will throw an error, a lot of errors will be output to
    // the console. Let's silence them so that the test output stays clean.
    jest.spyOn(console, 'error').mockImplementation();

    const inputCode = 'RANDOM_CODE';
    const inputState = 'RANDOM_STATE';

    setup({ inputState });

    fetchMock.post(
      'https://firefox-ci-tc.services.mozilla.com/login/oauth/token',
      {
        status: 403,
      },
    );

    renderWithRouter(<TaskclusterCallback />, {
      route: '/taskcluster-auth',
      search: `?code=${inputCode}&state=${inputState}`,
      loader,
    });

    expect(
      await screen.findByRole('heading', {
        name: /Error when requesting Taskcluster: \(403\) Forbidden/,
      }),
    ).toBeInTheDocument();
  });
});
