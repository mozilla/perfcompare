import {
  CredentialsResponse,
  TokenBearer,
  UserCredentials,
} from '../types/types';

export function storeToken(token: TokenBearer) {
  localStorage.setItem('tokenBearer', JSON.stringify(token));
}

export function retrieveToken(): TokenBearer {
  return JSON.parse(
    localStorage.getItem('tokenBearer') as string,
  ) as TokenBearer;
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
