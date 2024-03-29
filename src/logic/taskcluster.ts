// This file contains logic for the Taskcluster Third-Party Login

import { UserCredentials } from '../types/types';

export const prodTaskclusterUrl = 'https://firefox-ci-tc.services.mozilla.com';
export const stagingTaskclusterUrl =
  'https://stage.taskcluster.nonprod.cloudops.mozgcp.net';
export const tcClientIdMap: Record<string, string> = {
  'https://perf.compare': 'production',
  'https://beta--mozilla-perfcompare.netlify.app': 'beta',
  'http://localhost:3000': 'localhost-3000',
  'https://tc-staging.treeherder.nonprod.cloudops.mozgcp.net':
    'taskcluster-staging',
};

export const tcAuthCallbackUrl = '/taskcluster-auth';
export const clientId = `perfcompare-${
  tcClientIdMap[window.location.origin]
}-client`;
export const redirectURI = `${window.location.origin}${tcAuthCallbackUrl}`;

export const getRootUrl = (rootUrl: string) => {
  // we need this workaround for the perfcompare-taskcluster-staging deployment since all repository fixtures
  // and the default login rootUrls are for https://firefox-ci-tc.services.mozilla.com
  if (
    rootUrl === prodTaskclusterUrl &&
    clientId === 'perfcompare-taskcluster-staging-client'
  ) {
    return stagingTaskclusterUrl;
  }
  return rootUrl;
};

const generateNonce = () => {
  return window.crypto.randomUUID();
};

const getAuthCode = (taskclusterUrl: string) => {
  const nonce = generateNonce();
  sessionStorage.setItem('requestState', nonce); // The request state it's stored in sessionStorage so that it can be used in the callback
  sessionStorage.setItem('taskclusterUrl', taskclusterUrl);

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectURI,
    scope: 'hooks:trigger-hook:*',
    state: nonce,
  });
  const url = `${taskclusterUrl}/login/oauth/authorize/?${params.toString()}`;
  window.open(url, '_blank');
};

export const checkTaskclusterCredentials = () => {
  const taskclusterUrl = getRootUrl(prodTaskclusterUrl);
  const userCredentials = JSON.parse(
    sessionStorage.getItem('userCredentials') as string,
  ) as UserCredentials;

  if (
    !userCredentials ||
    !userCredentials[taskclusterUrl]
    // TODO: once the userCredentials are set in sessionStorage check if the "expires" date is in the past
  ) {
    getAuthCode(taskclusterUrl);
  }
  // TODO: handle case where the user navigates directly to the login route
};
