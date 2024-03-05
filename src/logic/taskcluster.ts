// This file contains logic for the Taskcluster Third-Party Login

import { prodFirefoxRootUrl, getRootUrl } from '../common/constants';
import { UserCredentials } from '../types/types';
import { generateNonce } from '../utils/helpers';

// For testing purposes
const treeherderClientId = `treeherder-localhost-5000-client`;
const treeherderRedirectURI = `http://localhost:5000/taskcluster-auth`;

const getAuthCode = (defaultRootUrl: string) => {
  const nonce = generateNonce();
  localStorage.setItem('requestState', nonce);
  localStorage.setItem('tcRootUrl', defaultRootUrl);

  const params = new URLSearchParams({
    // client_id: clientId,
    client_id: treeherderClientId,
    response_type: 'code',
    // redirect_uri: redirectURI,
    redirect_uri: treeherderRedirectURI,
    scope: 'hooks:trigger-hook:*',
    state: nonce,
  });
  const url = `${defaultRootUrl}/login/oauth/authorize/?${params.toString()}`;
  window.open(url, '_blank');
};

export const checkTaskclusterCredentials = () => {
  const defaultRootUrl = getRootUrl(prodFirefoxRootUrl);
  const userCredentials = JSON.parse(
    localStorage.getItem('userCredentials') as string,
  ) as UserCredentials;

  if (
    !userCredentials ||
    !userCredentials[defaultRootUrl as keyof UserCredentials]
    // TODO: once the userCredentials are set in localStorage check if the "expires" date is in the past
  ) {
    getAuthCode(defaultRootUrl);
  }
  // TODO: handle case where the user navigates directly to the login route
};
