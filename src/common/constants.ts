import { Dictionary } from '@reduxjs/toolkit';

import { Repository } from '../types/state';

export const treeherderBaseURL = 'https://treeherder.mozilla.org';

export const repoMapping: Dictionary<Repository['name']> = {
  1: 'mozilla-central',
  2: 'mozilla-beta',
  3: 'mozilla-release',
  4: 'try',
  30: 'fenix',
  77: 'autoland',
};

export const maxRevisionsError = 'Maximum four revisions.';
