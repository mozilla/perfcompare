import {
  UserCredentials,
  TokenBearer,
  UserCredentialsDictionary,
} from '../types/types';

type TokenBearerDictionary = Record<string, TokenBearer>;

export function storeUserToken(rootUrl: string, token: TokenBearer) {
  const allTokensAsString = localStorage.userTokens as string;
  const allTokens = (
    allTokensAsString ? JSON.parse(allTokensAsString) : {}
  ) as TokenBearerDictionary;

  allTokens[rootUrl] = token;
  localStorage.userTokens = JSON.stringify(allTokens);
}

export function retrieveToken(rootUrl: string): TokenBearer | null {
  const allUserTokensAsString = localStorage.userTokens as string;

  if (allUserTokensAsString) return null;

  const allTokens = JSON.parse(allUserTokensAsString) as TokenBearerDictionary;
  return allTokens[rootUrl] ?? null;
}

export function storeUserCredentials(
  rootUrl: string,
  credentials: UserCredentials,
) {
  const allCredentialsAsString = localStorage.userCredentials as string;
  const allCredentials = (
    allCredentialsAsString ? JSON.parse(allCredentialsAsString) : {}
  ) as UserCredentialsDictionary;

  allCredentials[rootUrl] = credentials;
  localStorage.userCredentials = JSON.stringify(allCredentials);
}

export function retrieveUserCredentials(
  rootUrl: string,
): UserCredentials | null {
  const allCredentialsAsString = localStorage.userCredentials as string;

  if (!allCredentialsAsString) return null;

  const allCredentials = JSON.parse(
    allCredentialsAsString,
  ) as UserCredentialsDictionary;
  return allCredentials[rootUrl] ?? null;
}

export function waitForStorageEvent(): Promise<void> {
  return new Promise((resolve) => {
    window.addEventListener(
      'storage',
      function storageListener(event: StorageEvent) {
        // TODO change userCredentials with userTokens
        // when the userCredentials fetch is moved here
        if (event.key === 'userCredentials') {
          resolve();
          window.removeEventListener('storage', storageListener);
        }
      },
    );
  });
}
