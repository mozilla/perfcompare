import { Dictionary } from '@reduxjs/toolkit';

import { Repository } from '../types/state';

export const treeherderBaseURL = 'https://treeherder.mozilla.org';

export const repoList = ['try', 'autoland', 'mozilla-central'];

export const repoMapping: Dictionary<Repository['name']> = {
  1: 'mozilla-central',
  4: 'try',
  77: 'autoland',
};

export const maxRevisionsError = 'Maximum four revisions.';
