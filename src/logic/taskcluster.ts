// This file contains logic for the Taskcluster Third-Party Login

import { UserCredentials } from '../types/types';

export const prodTaskclusterUrl = 'https://firefox-ci-tc.services.mozilla.com';
export const stagingTaskclusterUrl =
  'https://stage.taskcluster.nonprod.cloudops.mozgcp.net';
export const stagingClientId = 'perfcompare-staging-client';
export const tcClientIdMap: Record<string, string> = {
  'https://perf.compare': 'production',
  'https://beta--mozilla-perfcompare.netlify.app': 'beta',
  'http://localhost:3000': 'localhost-3000',
};

export const getTaskclusterParams = () => {
  const redirectUri = `${window.location.origin}/taskcluster-auth`;
  let tcParams = {
    url: prodTaskclusterUrl,
    redirectUri: redirectUri,
    clientId: `perfcompare-${tcClientIdMap[window.location.origin]}-client`,
  };
  if (window.location.hash.includes('taskcluster-staging')) {
    tcParams.url = stagingTaskclusterUrl;
    tcParams.clientId = stagingClientId;
  }
  return tcParams;
};

const generateNonce = () => {
  return window.crypto.randomUUID();
};

const getAuthCode = (tcParams: {
  url: string;
  redirectUri: string;
  clientId: string;
}) => {
  const nonce = generateNonce();
  sessionStorage.setItem('requestState', nonce); // The request state it's stored in sessionStorage so that it can be used in the callback
  sessionStorage.setItem('taskclusterUrl', tcParams.url);

  const params = new URLSearchParams({
    client_id: tcParams.clientId,
    response_type: 'code',
    redirect_uri: tcParams.redirectUri,
    scope: 'hooks:trigger-hook:*',
    state: nonce,
  });
  const url = `${tcParams.url}/login/oauth/authorize/?${params.toString()}`;
  window.open(url, '_blank');
};

export const checkTaskclusterCredentials = () => {
  const taskclusterParams = getTaskclusterParams();
  const userCredentials = JSON.parse(
    sessionStorage.getItem('userCredentials') as string,
  ) as UserCredentials;

  if (
    !userCredentials ||
    !userCredentials[taskclusterParams.url]
    // TODO: once the userCredentials are set in sessionStorage check if the "expires" date is in the past
  ) {
    getAuthCode(taskclusterParams);
  }
  // TODO: handle case where the user navigates directly to the login route
};
