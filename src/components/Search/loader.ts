import type { Params } from 'react-router-dom';

import { fetchRecentRevisions as fetchRecentRevisionsOnTreeherder } from '../../logic/treeherder';

export async function loader({
  params,
}: {
  params: Params<'repository' | 'author' | 'hash'>;
}) {
  const { repository } = params;
  if (!repository) {
    throw new Error("The repository param is missing, this shouldn't happen.");
  }

  // The spread operation tells TypeScript that we checked `repository` in this object.
  return fetchRecentRevisionsOnTreeherder({ ...params, repository });
}
