import { useEffect } from 'react';

import { useParams } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../hooks/app';
import useFetchCompareResults from '../../hooks/useFetchCompareResults';
import { clearSelectedRevisions } from '../../reducers/SelectedRevisions';
import { Revision } from '../../types/state';

// component to fetch set selected revisions when Compare View is loaded
function CompareResultsViewInit() {
  const dispatch = useAppDispatch();

  const selectedRevisions = useAppSelector(
    (state) => state.selectedRevisions.revisions,
  );

  const { repos, revs } = useParams();

  useEffect(() => {
    if (repos && revs) {
      const paramRepos: string[] = repos.split(',');
      const paramRevs: string[] = revs.split(',');
      const currentRevs: string[] = selectedRevisions.map(
        (item) => item.revision,
      );
      dispatch(clearSelectedRevisions());

      let newSelected: Revision[];
      if (paramRevs !== currentRevs) {
        paramRepos.forEach((item) => {
          const newRevision = fetch();
        });
      }
    }
  });

  return null;
}

export default CompareResultsViewInit;
