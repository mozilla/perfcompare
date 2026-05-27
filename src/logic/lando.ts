import { LandoToCommit } from '../types/state';

const landoInstances = {
  'lando-dev': 'api.dev.lando.nonprod.cloudops.mozgcp.net',
  'lando-dev-2025': 'lando-dev.allizom.org',
  'lando-prod': 'api.lando.services.mozilla.com',
  'lando-prod-2025': 'lando.moz.tools',
};

export type LandoInstance = keyof typeof landoInstances;

async function fetchFromLando(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Error when requesting lando: (${response.status}) ${response.statusText}`,
    );
  }
  return response;
}

export async function fetchRevisionFromLandoId(
  landoid: string,
  instance: LandoInstance = 'lando-prod',
) {
  const host = landoInstances[instance] ?? landoInstances['lando-prod'];
  const url = `https://${host}/landing_jobs/${landoid}`;
  const response = await fetchFromLando(url);
  return response.json() as Promise<LandoToCommit>;
}
