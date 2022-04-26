import type { Repository } from '../types/state';

export const treeherderBaseURL: string = 'https://treeherder.mozilla.org';

export const repoList: Repository['name'][] = [
  'try',
  'autoland',
  'mozilla-central',
];
