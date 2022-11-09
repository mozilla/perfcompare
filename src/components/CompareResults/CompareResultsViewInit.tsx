import { useEffect, useState } from 'react';

import { useSnackbar, VariantType } from 'notistack';
import { useParams } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../hooks/app';
import useFetchCompareResults from '../../hooks/useFetchCompareResults';
import {
  clearSelectedRevisions,
  setSelectedRevisions,
} from '../../reducers/SelectedRevisions';
import { fetchSelectedRevisions } from '../../thunks/selectedRevisionsThunk';
import type { Revision } from '../../types/state';
import { fetchCompareResults } from '../../thunks/compareResultsThunk';
import { repoMap } from '../../common/constants';
// component to fetch set selected revisions when Compare View is loaded
function CompareResultsViewInit() {
  const dispatch = useAppDispatch();
  const selectedRevisions = useAppSelector(
    (state) => state.selectedRevisions.revisions,
  );
  const selected = selectedRevisions.map((item) => item.revision);

  const { repos, revs } = useParams();
  let paramRepos: string[];
  let paramRevs: string[];
  if (repos && revs) {
    paramRepos = repos.split(',');
    paramRevs = revs.split(',');
  }

  const { enqueueSnackbar } = useSnackbar();

  const { useFetchSelectedRevisions } = useFetchCompareResults();

  const [newSelected, setNewSelected] = useState([]);

  useEffect(() => {
    let isSubscribed = true;

    const fetchData = async (repo: string, rev: string) => {
      const data = await dispatch(fetchSelectedRevisions({ repo, rev }));

      if (isSubscribed) {
        setNewSelected((prev) => [...prev, data.payload]);
      }
    };

    if (paramRevs !== selected) {
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
      selected !== paramRevs &&
      paramRevs.length > 0 &&
      paramRevs.length === newSelected.length
    ) {
      dispatch(setSelectedRevisions(newSelected));
    } else if (selectedRevisions === newSelected) {
      const compareRepos = selectedRevisions.map(
        (item) => repoMap[item.repository_id],
      );
      const compareRevs = selectedRevisions.map((item) => item.revision);
      void dispatch(fetchCompareResults({ compareRepos, compareRevs }));
    }
  }, [newSelected]);

  return <></>;
}

export default CompareResultsViewInit;
