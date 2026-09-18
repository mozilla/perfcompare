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
  // New Lando returns "" rather than null when a job has not produced a revision.
  return typeof job.commit_id === 'string' && job.commit_id.trim().length > 0;
}

function firstLine(text: string | undefined): string | undefined {
  if (!text) {
    return undefined;
  }
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed) {
      return trimmed;
    }
  }
  return undefined;
}

export function messageForMissingLandoRevision(
  landoId: string,
  job: LandoToCommit,
) {
  const status = job.status?.trim() ? job.status : 'unknown';
  const normalizedStatus = status.toLowerCase();

  if (FAILED_STATUSES.has(normalizedStatus)) {
    return Strings.errors.lando.failed(landoId, status, firstLine(job.error));
  }

  if (PENDING_STATUSES.has(normalizedStatus)) {
    return Strings.errors.lando.pending(landoId, status);
  }

  return Strings.errors.lando.landedWithoutRevision(landoId, status);
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
  landoId: string,
  instance: LandoInstance = 'lando-prod',
): Promise<LandoRevision> {
  const host = landoInstances[instance] ?? landoInstances['lando-prod'];
  const url = `https://${host}/landing_jobs/${landoId}`;
  const response = await fetchFromLando(url);
  const job = (await response.json()) as LandoToCommit;

  if (!hasCommitId(job)) {
    throw new Error(messageForMissingLandoRevision(landoId, job));
  }

  return job;
}
