import {
  CredentialsResponse,
  UserToken,
  TokenBearerResponse,
  UserCredentials,
  TokenResponse,
} from '../types/types';

export function storeUserToken(rootUrl: string, token: TokenBearerResponse) {
  const allTokensAsString = localStorage.userTokens as string;
  const allTokens = (
    allTokensAsString ? JSON.parse(allTokensAsString) : {}
  ) as UserToken;

  allTokens[rootUrl] = token;
  localStorage.userTokens = JSON.stringify(allTokens);
}

export function retrieveToken(rootUrl: string): TokenResponse | null {
  const allUserTokensAsString = localStorage.userTokens as string;

  if (allUserTokensAsString) return null;

  const allTokens = JSON.parse(allUserTokensAsString) as UserToken;
  return allTokens[rootUrl];
}

export function storeUserCredentials(
  rootUrl: string,
  credentials: CredentialsResponse,
) {
  const allCredentialsAsString = localStorage.userCredentials as string;
  const allCredentials = (
    allCredentialsAsString ? JSON.parse(allCredentialsAsString) : {}
  ) as UserCredentials;

  allCredentials[rootUrl] = credentials;
  localStorage.userCredentials = JSON.stringify(allCredentials);
}

export function retrieveUserCredentials(
  rootUrl: string,
): CredentialsResponse | null {
  const allCredentialsAsString = localStorage.userCredentials as string;

  if (allCredentialsAsString) return null;

  const allCredentials = JSON.parse(allCredentialsAsString) as UserCredentials;
  return allCredentials[rootUrl];
}
