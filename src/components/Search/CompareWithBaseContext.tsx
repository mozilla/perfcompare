import React, { Dispatch, SetStateAction } from 'react';

import { RevisionsList, Repository, ThemeMode } from '../../types/state';

interface RevisionsState {
  revs: RevisionsList[];
  repos: Repository['name'][];
}

interface InProgressState {
  revs: RevisionsList[];
  repos: Repository['name'][];
  isInProgress: boolean;
}

interface ContextState {
  mode: ThemeMode;
  isEditable: boolean;
  isWarning: boolean;
  baseStaging: RevisionsState;
  newStaging: RevisionsState;
  baseInProgress: InProgressState;
  newInProgress: InProgressState;
  setInProgressBase: Dispatch<SetStateAction<InProgressState>>;
  setInProgressNew: Dispatch<SetStateAction<InProgressState>>;
  setStagingBase: Dispatch<SetStateAction<RevisionsState>>;
  setStagingNew: Dispatch<SetStateAction<RevisionsState>>;
}

const revRepos = {
  revs: [],
  repos: [],
};
// Create a new context
const CompareBaseContext = React.createContext<ContextState>({
  mode: 'light',
  isEditable: false,
  isWarning: false,
  baseStaging: revRepos,
  newStaging: revRepos,
  baseInProgress: { ...revRepos, isInProgress: false },
  newInProgress: { ...revRepos, isInProgress: false },
  setInProgressBase: () => {},
  setInProgressNew: () => {},
  setStagingBase: () => {},
  setStagingNew: () => {},
});

export default CompareBaseContext;
