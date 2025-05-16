import { LandoToCommit } from '../types/state';

const landoBaseUrl = 'https://api.lando.services.mozilla.com';

async function fetchFromLando(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Error when requesting lando: (${response.status}) ${response.statusText}`,
    );
  }
  return response;
}

export async function fetchRevisionFromLandoId(landoid: string) {
  const url = `${landoBaseUrl}/landing_jobs/${landoid}`;
  const response = await fetchFromLando(url);
  return response.json() as Promise<LandoToCommit>;
}
