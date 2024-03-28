import TaskclusterCallback from '../../components/TaskclusterAuth/TaskclusterCallback';
import { FetchMockSandbox, renderWithRouter } from '../utils/test-utils';

describe('Taskcluster Callback', () => {
  it('should fetch access token bearer', () => {
    (window.fetch as FetchMockSandbox).post(
      'begin:https://firefox-ci-tc.services.mozilla.com/login/oauth/token',
      {
        access_token: 'RnVpOGJtdDZTb3FlWW5PVUxVclprQQ==',
        token_type: 'Bearer',
      },
    );

    renderWithRouter(<TaskclusterCallback />, {
      route: '/taskcluster-auth',
      search: '?code=dwcygG5HQNaLiRe3RcTCbQ&state=OkCrH5isZncYqeJbRDelN',
    });

    expect(window.fetch).toHaveBeenCalledTimes(1);
  });
});
