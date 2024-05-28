import { TokenBearer } from '../types/types';

export function storeTokenBearer(token: TokenBearer) {
  localStorage.setItem('tokenBearer', JSON.stringify(token));
}

export function retrieveTokenBearer(): TokenBearer {
  return JSON.parse(
    localStorage.getItem('tokenBearer') as string,
  ) as TokenBearer;
}
