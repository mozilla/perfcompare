// This file contains logic for the Taskcluster Third-Party Login

import { UserCredentials, TokenBearer } from '../types/types';
import { getLocationOrigin } from '../utils/location';
import {
  waitForStorageEvent,
  retrieveUserCredentials,
} from './credentials-storage';

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
  const locationOrigin = getLocationOrigin();
  const redirectUri = `${locationOrigin}/taskcluster-auth`;
  const tcParams = {
    url: prodTaskclusterUrl,
    redirectUri: redirectUri,
    clientId: tcClientIdMap[locationOrigin],
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

type TaskclusterParams = {
  url: string;
  redirectUri: string;
  clientId: string;
};

// This function opens a new tab to the taskcluster authentication requesting a
// code. After authentication it will redirect to our redirectUri page
// /taskcluster-auth with the code, then it will set the result to localStorage.
// waitForStorageEvent will wait for this.
const openTaskclusterAuthenticationPage = (tcParams: TaskclusterParams) => {
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

// This function returns the stored credentials in localStorage.
export const getTaskclusterCredentials = (
  taskclusterParams: TaskclusterParams,
) => {
  const locationOrigin = getLocationOrigin();

  if (!taskclusterParams.clientId) {
    alert(`No clientId is configured for origin ${locationOrigin}, sorry!`);
    return;
  }

  const credentials = retrieveUserCredentials(taskclusterParams.url);
  return credentials;
};

// This returns the taskcluster access token, either stored or possibly opening
// a new tab for authentication.
export async function getTaskclusterAccessToken() {
  const taskclusterParams = getTaskclusterParams();
  let accessToken = getTaskclusterCredentials(taskclusterParams);
  if (!accessToken) {
    openTaskclusterAuthenticationPage(taskclusterParams);
    await waitForStorageEvent();
    accessToken = getTaskclusterCredentials(taskclusterParams);

    if (!accessToken) {
      throw new Error("Couldn't retrieve an access token for taskcluster");
    }
  }

  return accessToken;
}

async function checkTaskclusterResponse(response: Response) {
  if (!response.ok) {
    if (response.status === 400) {
      throw new Error(
        `Error when requesting Taskcluster: ${await response.text()}`,
      );
    } else {
      throw new Error(
        `Error when requesting Taskcluster: (${response.status}) ${response.statusText}`,
      );
    }
  }
}

export async function retrieveTaskclusterToken(rootUrl: string, code: string) {
  const tcAuthCallbackUrl = '/taskcluster-auth';
  const redirectURI = `${window.location.origin}${tcAuthCallbackUrl}`;
  const locationOrigin = getLocationOrigin();
  const clientId = tcClientIdMap[locationOrigin];

  // prepare to fetch token Bearer, it will be used to fetch the access_token
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectURI,
    client_id: clientId,
  });

  const options = {
    method: 'POST',
    body: body,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  };

  const url = `${rootUrl}/login/oauth/token`;

  // fetch token Bearer
  const response = await fetch(url, options);

  void checkTaskclusterResponse(response);

  return response.json() as Promise<TokenBearer>;
}

export async function retrieveTaskclusterUserCredentials(
  rootUrl: string,
  tokenBearer: string,
) {
  const options = {
    headers: {
      Authorization: `Bearer ${tokenBearer}`,
      'Content-Type': 'aplication/json',
    },
  };

  const url = `${rootUrl}/login/oauth/credentials`;

  // fetch Taskcluster credentials using token Bearer
  const response = await fetch(url, options);

  void checkTaskclusterResponse(response);

  return response.json() as Promise<UserCredentials>;
}
