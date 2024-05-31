import { UserCredentials } from '../types/types';
import { TokenBearer } from '../types/types';

export function storeToken(token: TokenBearer) {
  localStorage.setItem('tokenBearer', JSON.stringify(token));
}

export function retrieveToken(): TokenBearer {
  return JSON.parse(
    localStorage.getItem('tokenBearer') as string,
  ) as TokenBearer;
}

export function storeUserCredentials(credentials: UserCredentials) {
  localStorage.setItem('userCredentials', JSON.stringify(credentials));
}

export function retrieveUserCredentials(): UserCredentials {
  return JSON.parse(
    localStorage.getItem('userCredentials') as string,
  ) as UserCredentials;
}
