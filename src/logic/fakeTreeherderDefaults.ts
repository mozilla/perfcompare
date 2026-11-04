// The comparison displayed by `/compare-results?fakedata` when no revisions are
// given in the URL. This is kept separate from ./fakeTreeherder.ts so that the
// loaders can use it without pulling the whole fake backend in the main bundle.

import type { Repository } from '../types/state';
import type { Framework } from '../types/types';

export const fakeDefaultComparison: {
  baseRev: string;
  baseRepo: Repository['name'];
  newRevs: string[];
  newRepos: Repository['name'][];
  frameworkIds: Framework['id'][];
} = {
  baseRev: 'f4ce5a1e7b0c43d2a9e8b16d5c3f7a20b9e14d68',
  baseRepo: 'mozilla-central',
  newRevs: [
    'a7d31c9e52f84b06d1e9c3a85f27b4e60c8d9f13',
    '3be98f0d6a4c21e57b9d08f3c6a1e4d27f5b8c90',
    'c05e7a2d9b18f46e3a7c50d2e9b84f1a6d3c7e25',
  ],
  newRepos: ['try', 'try', 'autoland'],
  frameworkIds: [1, 13],
};
