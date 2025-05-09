import { checkValues, getComparisonInformation } from './loader';
import { compareView } from '../../common/constants';
import { fetchRevisionFromHash } from '../../logic/treeherder';
import { Changeset, CompareResultsItem, Repository } from '../../types/state';
import { Framework } from '../../types/types';

// This function is responsible for fetching the data from the URL. It's called
// by React Router DOM when the compare-hash-results path is requested.
// This loader is the only one used by ./mach try perf, and due to recent
// changes mach try perf we can't get instant push links to try when we push.
// We attach a hash to the commit message and search for that hash, and return
// the commit associated with that hash and update the baseRev and newRev
export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const baseHashFromUrl = url.searchParams.get('baseHash');
  const baseHashDateFromUrl = url.searchParams.get('baseHashDate');
  const newHashFromUrl = url.searchParams.get('newHash');
  const newHashDateFromUrl = url.searchParams.get('newHashDate') as string;
  const baseRepoFromUrl = url.searchParams.get('baseRepo') as
    | Repository['name']
    | null;
  const newReposFromUrl = url.searchParams.getAll(
    'newRepo',
  ) as Repository['name'][];
  const frameworkFromUrl = url.searchParams.get('framework');
  const pushed_today =
    new Date(newHashDateFromUrl).toISOString().split('T')[0] ==
    new Date().toISOString().split('T')[0];
  let commits_from_hashes: CommitFromHashData = {
    baseRevision: '',
    newRevision: '',
  };
  if (
    !baseHashFromUrl ||
    !baseHashDateFromUrl ||
    !newHashFromUrl ||
    !newHashDateFromUrl
  ) {
    throw new Error(
      'Not all values were supplied please check you provided all 4 of: baseHash, baseHashDate, newHash, newHashDate',
    );
  }
  try {
    commits_from_hashes = await fetchRevisionFromHash(
      baseHashFromUrl,
      baseHashDateFromUrl,
      newHashFromUrl,
      newHashDateFromUrl,
      'try',
    );
  } catch (e) {
    if (pushed_today) {
      throw new Error('Results pushed today, still processing...');
    } else {
      throw e;
    }
  }
  const baseRevsFromHash = commits_from_hashes.baseRevision;
  const newRevsFromHash = [commits_from_hashes.newRevision];
  const { baseRev, baseRepo, newRevs, newRepos, frameworkId, frameworkName } =
    checkValues({
      baseRev: baseRevsFromHash,
      baseRepo: baseRepoFromUrl,
      newRevs: newRevsFromHash,
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
  );
}

type HashLoaderData = {
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

type CommitFromHashData = {
  baseRevision: string;
  newRevision: string;
};
export type HashLoaderReturnValue = HashLoaderData;
