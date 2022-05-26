import React from 'react';

import SearchView from '../components/Search/SearchView';
import SelectedRevisionsTable from '../components/Shared/SelectedRevisionsTable';
import { resetState } from '../reducers/SelectedRevisions';
import { render, store, screen } from './utils/test-utils';

describe('Search View', () => {
  afterEach(() => {
    store.dispatch(resetState());
  });

  it('should render correctly when there are revisions', () => {
    render(<SelectedRevisionsTable />);
    expect(screen.getByText('coconut')).toBeInTheDocument();
  });

  it('should delete revisions after click and not show revisions table if no revisions', async () => {
    render(<SearchView />);
    const button = document.querySelectorAll('#close-button');

    await (button[0] as HTMLButtonElement).click();
    await (button[1] as HTMLButtonElement).click();

    expect(store.getState().selectedRevisions.revisions).toEqual([]);
    expect(screen.queryByText('Commit Message')).not.toBeInTheDocument();
  });
});
