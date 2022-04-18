import { createSlice } from '@reduxjs/toolkit';

import { SelectedRevisionsState } from '../types/state';

const initialState: SelectedRevisionsState = {
  revisions: [
    {
      id: 1,
      revision: 'coconut',
      author: 'john@python.com',
      push_timestamp: 42,
      repository_id: 4,
      revision_count: 0,
      revisions: [
        {
          revision: 'coconut',
          author: 'john@python.com',
          comments: 'This is my first message',
          result_set_id: 0,
          repository_id: 0,
        },
      ],
    },
    {
      id: 2,
      revision: 'coconut 2',
      author: 'johncleese@python.com',
      push_timestamp: 43,
      repository_id: 4,
      revision_count: 1,
      revisions: [
        {
          revision: 'coconut 2',
          author: 'johncleese@python.com',
          comments: 'This is the second message',
          result_set_id: 0,
          repository_id: 0,
        },
      ],
    },
  ],
};

const selectedRevisions = createSlice({
  name: 'selectedRevisions',
  initialState,
  reducers: {
    resetState(state) {
      state.revisions = initialState.revisions;
    },
    deleteRevision(state, action) {
      return {
        revisions: state.revisions.filter(
          (revision) => revision.id !== action.payload,
        ),
      };
    },
  },
});

export const { resetState, deleteRevision } = selectedRevisions.actions;
export default selectedRevisions.reducer;
