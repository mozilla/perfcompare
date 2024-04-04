import type { Params } from 'react-router-dom';

import { fetchRecentRevisions as fetchRecentRevisionsOnTreeherder } from '../../logic/treeherder';

export async function loader({
  params,
}: {
  params: Params<'repository' | 'author' | 'hash'>;
}) {
  const { repository } = params;
  if (!repository) {
    // This error is a programming error, so we expose it as an application crash.
    throw new Error("The repository param is missing, this shouldn't happen.");
  }

  try {
    // The spread operation tells TypeScript that we checked `repository` in this object.
    const results = await fetchRecentRevisionsOnTreeherder({
      ...params,
      repository,
    });

    if (!results.length) {
      throw new Error('No results found');
    }

    return { results };
  } catch (error) {
    // Errors thrown by fetchRecentRevisionsOnTreeherder and others are
    // gracefully handled so that we can show a nice message to the user.
    const strError =
      typeof error === 'string'
        ? error
        : error instanceof Error
        ? error.message
        : `Unknown error: ${String(error)}`;
    return { error: strError };
  }
}

export type LoaderReturnValue = Awaited<ReturnType<typeof loader>>;
