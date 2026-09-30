import { Strings } from '../resources/Strings';
import { LandoToCommit } from '../types/state';

const landoInstances = {
  'lando-dev': 'api.dev.lando.nonprod.cloudops.mozgcp.net',
  'lando-dev-2025': 'lando-dev.allizom.org',
  'lando-prod': 'api.lando.services.mozilla.com',
  'lando-prod-2025': 'lando.moz.tools',
};

export type LandoInstance = keyof typeof landoInstances;

export type LandoRevision = LandoToCommit & { commit_id: string };

const PENDING_STATUSES = new Set([
  'submitted',
  'in_progress',
  'deferred',
  'created',
  'unknown',
]);

const FAILED_STATUSES = new Set(['failed', 'aborted', 'cancelled', 'canceled']);

function hasCommitId(job: LandoToCommit): job is LandoRevision {
  return typeof job.commit_id === 'string' && job.commit_id.length > 0;
}

export function messageForMissingLandoRevision(
  landoid: string,
  job: LandoToCommit,
) {
  const status = job.status?.trim() ? job.status : 'unknown';
  const normalizedStatus = status.toLowerCase();

  if (FAILED_STATUSES.has(normalizedStatus)) {
    return Strings.errors.lando.failed(
      landoid,
      status,
      job.error?.trim() || undefined,
    );
  }

  if (PENDING_STATUSES.has(normalizedStatus)) {
    return Strings.errors.lando.pending(landoid, status);
  }

  return Strings.errors.lando.landedWithoutRevision(landoid, status);
}

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
): Promise<LandoRevision> {
  const host = landoInstances[instance] ?? landoInstances['lando-prod'];
  const url = `https://${host}/landing_jobs/${landoid}`;
  const response = await fetchFromLando(url);
  const job = (await response.json()) as LandoToCommit;

  if (!hasCommitId(job)) {
    throw new Error(messageForMissingLandoRevision(landoid, job));
  }

  return job;
}
