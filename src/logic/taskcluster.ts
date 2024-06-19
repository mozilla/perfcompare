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
export const getTaskclusterCredentials = () => {
  const taskclusterParams = getTaskclusterParams();
  const locationOrigin = getLocationOrigin();

  if (!taskclusterParams.clientId) {
    alert(`No clientId is configured for origin ${locationOrigin}, sorry!`);
    return;
  }

  const credentials = retrieveUserCredentials(taskclusterParams.url);
  // TOOD Check if it is expired, return false if they are.
  return credentials;
};

// This function opens a new page to the taskcluster authentication, and waits
// for the user credentials to be stored in localStorage.
export async function signInIntoTaskcluster() {
  const taskclusterParams = getTaskclusterParams();
  openTaskclusterAuthenticationPage(taskclusterParams);
  await waitForStorageEvent();
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

type Action = {
  hookId: string;
  hookGroupId: string; // check to see if it used
  kind: 'hook';
  hookPayload: unknown;
  name: string;
};

export async function fetchActionsFromDecisionTask(
  rootUrl: string,
  decisionTaskId: string,
) {
  const url = `${rootUrl}/api/queue/v1/task/${decisionTaskId}/artifacts/public%2Factions.json`;

  const response = await fetch(url);

  void checkTaskclusterResponse(response);

  return (await response.json()) as {
    actions: Array<Action>;
    variables: unknown;
  };
}

export async function fetchTaskInformationFromTaskId(
  rootUrl: string,
  taskId: string,
) {
  const url = `${rootUrl}/api/queue/v1/task/${taskId}`;

  const response = await fetch(url);

  void checkTaskclusterResponse(response);

  return (await response.json()) as { scopes: Array<string> };
}

export async function expandScopes(rootUrl: string, scopes: Array<string>) {
  const url = `${rootUrl}/api/auth/v1/scopes/expand`;

  const options = {
    method: 'POST',
    body: JSON.stringify({ scopes }),
    headers: { 'Content-Type': 'application/json' },
  };

  const response = await fetch(url, options);

  void checkTaskclusterResponse(response);

  const json = (await response.json()) as { scopes: Array<string> };

  return json.scopes;
}

export async function triggerHook(
  rootUrl: string,
  accessToken: string,
  hookGroupId: string,
  hookId: string,
  hookPayload: string,
) {
  const url = `${rootUrl}/api/hooks/v1/hooks/${encodeURIComponent(
    hookGroupId,
  )}/${encodeURIComponent(hookId)}/trigger`;

  const options = {
    method: 'POST',
    body: JSON.stringify(hookPayload),
    headers: {
      Authorization: `Bearer ${accessToken}`, // to be checked
      'Content-Type': 'application/json',
    },
  };

  const response = await fetch(url, options);

  void checkTaskclusterResponse(response);

  const json = (await response.json()) as { taskId: string };

  return json.taskId;
}

export async function retrigger() {
  // GOAL: retrigger one job
  // Treeherder functions retriggerMultipleJobs, retriggerByRevision
  // retriggerMultipleJobs(currentRetriggerRow, baseRetriggerTimes, newRetriggerTimes, this.props)
  // retriggerByRevision(results.originalRtriggerableJobId, job repo, isBaseline=truOrFalse, retriggerTimes=1forNow, cevaPropsIdk)
  // retriggerByRevision uses JobModel.get(currentRepo.name, jobId), JobModel.retrigger([job], currentRepo, notify, times)
  // do not retrigger -> isBaseline && isBaseAggregate - nu inteleg
  // need access to repo
  // depends on jobId, currentRepo, isBaseline, times
}
