export type Repository =
  | { id: 1; name: 'mozilla-central' }
  | { id: 2; name: 'mozilla-beta' }
  | { id: 3; name: 'mozilla-release' }
  | { id: 4; name: 'try' }
  | { id: 30; name: 'fenix' }
  | { id: 77; name: 'autoland' };

export type SubRevision = {
  result_set_id: number;
  repository_id: number;
  revision: string;
  author: string;
  comments: string;
};

export type Revision = {
  id: number;
  revision: string;
  author: string;
  revisions: SubRevision[];
  revision_count: number;
  push_timestamp: number;
  repository_id: Repository['id'];
};

export type SearchState = {
  repository: Repository['name'];
  searchResults: Revision[];
  searchValue: string;
  inputError: boolean;
  inputHelperText: string;
};

// contains the indices of currently checked revisions
// in searchResults state
export type CheckedRevisionsState = {
  revisions: number[];
};

export type SelectedRevisionsState = {
  revisions: Revision[];
};

export type State = {
  search: SearchState;
  selectedRevisions: SelectedRevisionsState;
};
