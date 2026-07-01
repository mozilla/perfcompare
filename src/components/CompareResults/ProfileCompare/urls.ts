// TODO: Point this at https://profiler.firefox.com/compare-benchmark/ once
// the feature lands in production (see the PR at
// https://github.com/firefox-devtools/profiler/pull/6012).
const COMPARE_BENCHMARK_BASE_URL =
  'https://deploy-preview-6012--perf-html.netlify.app';

const PROFILER_BASE_URL = 'https://profiler.firefox.com';
const TC_ARTIFACT_BASE_URL = 'https://firefox-ci-tc.services.mozilla.com';

// The name of the compact-profile artifact that the browsertime speedometer3
// task uploads. We match on this exact name to decide whether a run is
// eligible for profile comparison.
export const SPEEDOMETER3_PROFILE_ARTIFACT =
  'public/test_info/profile_speedometer3_compact.jslb.gz';

export function buildTaskArtifactUrl(
  taskId: string,
  runId: number,
  artifactPath: string,
): string {
  return `${TC_ARTIFACT_BASE_URL}/api/queue/v1/task/${taskId}/runs/${runId}/artifacts/${artifactPath}`;
}

// Builds a profiler.firefox.com URL that loads a single profile from a
// Taskcluster artifact. The resulting URL is safe to use as an `href`.
export function buildSingleProfileUrl(
  taskId: string,
  runId: number,
  artifactPath: string = SPEEDOMETER3_PROFILE_ARTIFACT,
): string {
  const artifactUrl = buildTaskArtifactUrl(taskId, runId, artifactPath);
  return `${PROFILER_BASE_URL}/from-url/${encodeURIComponent(artifactUrl)}`;
}

// Builds a URL for the profiler's benchmark-comparison view, comparing the
// two given profiler-URLs (each already a from-url URL). URLSearchParams is
// deliberately used so the encoding matches profiler.firefox.com's parser.
export function buildCompareBenchmarkUrl(
  baseProfileUrl: string,
  newProfileUrl: string,
): string {
  const params = new URLSearchParams();
  params.append('profiles[]', baseProfileUrl);
  params.append('profiles[]', newProfileUrl);
  return `${COMPARE_BENCHMARK_BASE_URL}/compare-benchmark/?${params.toString()}`;
}
