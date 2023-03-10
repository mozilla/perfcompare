import { Revision } from '../types/state';

export const SET_CHECKED_REVISIONS = 'SET_CHECKED_REVISIONS';

export interface SetCheckedRevisionsAction {
  type: typeof SET_CHECKED_REVISIONS;
  revisions: Revision[];
}

export function setCheckedRevisions(revisions: Revision[]): SetCheckedRevisionsAction {
  return {
    type: SET_CHECKED_REVISIONS,
    revisions,
  };
}
