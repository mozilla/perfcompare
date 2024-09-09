// This file contains logic for the Taskcluster Third-Party Login

import jsone from 'json-e';
import { Hooks } from 'taskcluster-client-web';

import { JobInformation } from '../types/api';
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
  'https://main--mozilla-perfcompare.netlify.app': 'perfcompare-main-client',
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
    return false;
  }

  const credentials = retrieveUserCredentials(taskclusterParams.url);

  if (!credentials?.expires) {
    return false;
  }

  const expirationDate = new Date(credentials.expires);
  const currentDate = new Date();

  if (expirationDate < currentDate) return false;

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
  hookGroupId: string;
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

// This function's goal is to retrigger an existing job from its jobId. It will
// call all appropriate APIs from taskcluster.
export async function retrigger(retriggerJobConfig: {
  rootUrl: string;
  jobInfo: JobInformation;
  decisionTaskId: string;
  times: number;
}): Promise<string | null> {
  const { rootUrl, jobInfo, decisionTaskId, times } = retriggerJobConfig;

  if (!times) return null;

  const actionsResponse = await fetchActionsFromDecisionTask(
    rootUrl,
    decisionTaskId,
  );

  const retriggerAction = actionsResponse.actions.find(
    (action) => action.name === 'retrigger-multiple',
  );

  if (retriggerAction?.kind !== 'hook') {
    throw new Error('Missing hook kind for action');
  }

  // submit retrigger action to Taskcluster
  const context = Object.assign(
    {},
    {
      taskGroupId: decisionTaskId,
      taskId: jobInfo.task_id,
      input: {
        requests: [{ tasks: [jobInfo.job_type_name], times }],
      },
    },
    actionsResponse.variables,
  );

  const hookPayload = jsone(
    retriggerAction.hookPayload as Record<string, unknown>,
    context,
  ) as unknown;
  const { hookId, hookGroupId } = retriggerAction;
  const userCredentials = retrieveUserCredentials(rootUrl);
  const accessToken = userCredentials?.credentials.accessToken;

  if (!accessToken) {
    throw new Error('Missing access token for retriggering action.');
  }
  const hooks = new Hooks({
    rootUrl,
    credentials: userCredentials.credentials,
  });

  const response = await hooks.triggerHook(hookGroupId, hookId, hookPayload);

  return response.taskId;
}
