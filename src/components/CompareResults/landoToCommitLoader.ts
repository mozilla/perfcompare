import { checkValues, getComparisonInformation } from './loader';
import { compareView } from '../../common/constants';
import { fetchRevisionFromLandoId } from '../../logic/lando';
import { Changeset, CompareResultsItem, Repository } from '../../types/state';
import { Framework } from '../../types/types';

// This function is responsible for fetching the data from the URL. It's called
// by React Router DOM when the compare-lando-results route is requested.
// This loader is used by ./mach try perf, and due to recent changes in
// we now add the lando id. The lando id can be determined within about 30 seconds
// of pushing to resolve to the treeherder commit
export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const baseLandoIDFromUrl = url.searchParams.get('baseLando');
  const newLandoIDFromUrl = url.searchParams.get('newLando');
  const baseRepoFromUrl = url.searchParams.get('baseRepo') as
    | Repository['name']
    | null;
  const newReposFromUrl = url.searchParams.getAll(
    'newRepo',
  ) as Repository['name'][];
  const frameworkFromUrl = url.searchParams.get('framework');
  if (!baseLandoIDFromUrl || !newLandoIDFromUrl) {
    throw new Error(
      'Not all values were supplied please check you provided both baseLando and newLando',
    );
  }
  const replicates = url.searchParams.has('replicates');

  const baseRevisionsFromLando =
    await fetchRevisionFromLandoId(baseLandoIDFromUrl);
  const newRevisionsFromLando =
    await fetchRevisionFromLandoId(newLandoIDFromUrl);

  const { baseRev, baseRepo, newRevs, newRepos, frameworkId, frameworkName } =
    checkValues({
      baseRev: baseRevisionsFromLando.commit_id,
      baseRepo: baseRepoFromUrl,
      newRevs: [newRevisionsFromLando.commit_id],
      newRepos: newReposFromUrl,
      framework: frameworkFromUrl,
    });
  return await getComparisonInformation(
    baseRev,
    baseRepo,
    newRevs,
    newRepos,
    frameworkId,
    frameworkName,
    replicates,
  );
}

type LandoLoaderData = {
  results: Promise<CompareResultsItem[][]>;
  baseRev: string;
  baseRevInfo: Changeset;
  baseRepo: Repository['name'];
  newRevs: string[];
  newRevsInfo: Changeset[];
  newRepos: Repository['name'][];
  frameworkId: Framework['id'];
  frameworkName: Framework['name'];
  view: typeof compareView;
  generation: number;
};

export type LandoLoaderReturnValue = LandoLoaderData;
