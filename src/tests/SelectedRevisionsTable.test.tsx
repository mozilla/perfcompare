import React from 'react';

import userEvent from '@testing-library/user-event';

import SearchView from '../components/Search/SearchView';
import SelectedRevisionsTable from '../components/Shared/SelectedRevisionsTable';
import { resetState } from '../reducers/SelectedRevisions';
import { render, store, screen, renderWithRouter } from './utils/test-utils';

describe('Search View', () => {
  afterEach(() => {
    store.dispatch(resetState());
  });

  it('should render correctly when there are revisions', () => {
    render(<SelectedRevisionsTable />);
    expect(screen.getByText('coconut')).toBeInTheDocument();
  });

  it('should delete revisions after click and not show revisions table if no revisions', async () => {
     // set delay to null to prevent test time-out due to useFakeTimers
     const user = userEvent.setup({ delay: null });

    renderWithRouter(<SearchView />);
    const button = document.querySelectorAll('#close-button');

    await user.click(button[0]);
    await user.click(button[1]);

    expect(store.getState().selectedRevisions.revisions).toEqual([]);
    expect(screen.queryByText('Commit Message')).not.toBeInTheDocument();
  });
});
