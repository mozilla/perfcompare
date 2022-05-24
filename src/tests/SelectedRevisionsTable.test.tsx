import React from 'react';

import SelectedRevisionsTable from '../components/Search/SelectedRevisionsTable/SelectedRevisionsTable';
import { resetState } from '../reducers/SelectedRevisions';
import { render, store, screen } from './utils/test-utils';

describe('Search View', () => {
  afterEach(() => {
    store.dispatch(resetState());
  });

  it('should render correctly when there are revisions', () => {
    render(<SelectedRevisionsTable />);
    expect(screen.getByText('Maximum 4 revisions.')).toBeInTheDocument();
  });

  it('should delete revisions after click', async () => {
    // testing delete functionality
    render(<SelectedRevisionsTable />);
    const button = document.querySelectorAll('#close-button');

    await (button[0] as HTMLButtonElement).click();
    await (button[1] as HTMLButtonElement).click();

    render(<SelectedRevisionsTable />);

    expect(store.getState().selectedRevisions.revisions).toEqual([]);
  });
});
