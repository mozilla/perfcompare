import { UserCredentials } from '../types/types';

export function storeUserCredentials(credentials: UserCredentials) {
  localStorage.setItem('userCredentials', JSON.stringify(credentials));
}

export function retrieveUserCredentials(): UserCredentials {
  return JSON.parse(
    localStorage.getItem('userCredentials') as string,
  ) as UserCredentials;
}
