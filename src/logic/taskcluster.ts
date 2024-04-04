// This file contains logic for the Taskcluster Third-Party Login

import { UserCredentials } from '../types/types';

export const prodTaskclusterUrl = 'https://firefox-ci-tc.services.mozilla.com';
export const stagingTaskclusterUrl =
  'https://stage.taskcluster.nonprod.cloudops.mozgcp.net';
export const stagingClientId = 'perfcompare-staging-client';
export const tcClientIdMap: Record<string, string> = {
  'https://perf.compare': 'perfcompare-production-client',
  'https://beta--mozilla-perfcompare.netlify.app': 'perfcompare-beta-client',
  'http://localhost:3000': 'perfcompare-localhost-3000-client',
};

export const getTaskclusterParams = () => {
  const redirectUri = `${window.location.origin}/taskcluster-auth`;
  let tcParams = {
    url: prodTaskclusterUrl,
    redirectUri: redirectUri,
    clientId: tcClientIdMap[window.location.origin],
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
  // The nonce is stored in sessionStorage so that it can be compared with the one received by the callback endpoint.
  sessionStorage.setItem('requestState', nonce);
  // The taskclusterUrl is also stored, so that the additional
  // requests done by the callback endpoint use the same URL.
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
