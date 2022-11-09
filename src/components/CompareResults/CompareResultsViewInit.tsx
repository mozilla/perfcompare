import { useEffect, useState } from 'react';

import { useParams } from 'react-router-dom';

import { repoMap } from '../../common/constants';
import { useAppDispatch, useAppSelector } from '../../hooks/app';
import useFetchCompareResults from '../../hooks/useFetchCompareResults';
import { setSelectedRevisions } from '../../reducers/SelectedRevisions';
import { fetchCompareResults } from '../../thunks/compareResultsThunk';
import { fetchSelectedRevisions } from '../../thunks/selectedRevisionsThunk';

// component to fetch set selectedRevs revisions when Compare View is loaded
function CompareResultsViewInit() {
  const dispatch = useAppDispatch();
  const selectedRevisions = useAppSelector(
    (state) => state.selectedRevisions.revisions,
  );
  const selectedRevs = selectedRevisions.map((item) => item.revision);

  const { repos, revs } = useParams();
  let paramRepos: string[];
  let paramRevs: string[];
  if (repos && revs) {
    paramRepos = repos.split(',');
    paramRevs = revs.split(',');
  }

  const { dispatchFetchCompareResults } = useFetchCompareResults();

  const [newSelected, setNewSelected] = useState([]);

  useEffect(() => {
    let isSubscribed = true;

    const fetchData = async (repo: string, rev: string) => {
      const data = await dispatch(fetchSelectedRevisions({ repo, rev }));

      if (isSubscribed) {
        setNewSelected((prev) => [...prev, data.payload]);
      }
    };

    if (paramRevs !== selectedRevs) {
      paramRepos.forEach((repo, index) => {
        const rev = paramRevs[index];
        fetchData(repo, rev).catch(console.error);
      });
    }

    return () => {
      isSubscribed = false;
    };
  }, []);

  useEffect(() => {
    console.log(selectedRevisions);
    console.log(newSelected);
    if (
      selectedRevs !== paramRevs &&
      paramRevs.length > 0 &&
      paramRevs.length === newSelected.length
    ) {
      dispatch(setSelectedRevisions(newSelected));
    } else if (selectedRevisions.sort() === newSelected.sort()) {
      const compareRepos = selectedRevisions.map(
        (item) => repoMap[item.repository_id],
      );
      const compareRevs = selectedRevisions.map((item) => item.revision);
      void dispatchFetchCompareResults(compareRepos, compareRevs);
    }
  }, [newSelected, selectedRevisions]);

  return <></>;
}

export default CompareResultsViewInit;
