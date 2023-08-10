import { useEffect } from 'react';

import type { Theme } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useLocation } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { style } from 'typestyle';

import { compareView } from '../../../common/constants';
import { useAppDispatch, useAppSelector } from '../../../hooks/app';
import useFetchCompareResults from '../../../hooks/useFetchCompareResults';
import useHandleChangeSearch from '../../../hooks/useHandleChangeSearch';
import { switchToFakeData } from '../../../reducers/CompareResults';
import { SearchContainerStyles } from '../../../styles';
import { background } from '../../../styles';
import { fetchRecentRevisions } from '../../../thunks/searchThunk';
import { Repository, View, InputType } from '../../../types/state';
import CompareWithBase from '../../Search/CompareWithBase';
import PerfCompareHeader from '../../Shared/PerfCompareHeader';
import ResultsMain from './ResultsMain';

interface ResultsViewProps {
  protocolTheme: Theme;
  toggleColorMode: () => void;
  title: string;
}
function ResultsView(props: ResultsViewProps) {
  const dispatch = useAppDispatch();
  const repositoryBase = useAppSelector(
    (state) => state.search.base.repository,
  );
  const repositoryNew = useAppSelector((state) => state.search.new.repository);
  const { protocolTheme, toggleColorMode, title } = props;
  const themeMode = protocolTheme.palette.mode;
  const styles = {
    container: style({
      backgroundColor: background(themeMode),
    }),
  };
  const [searchParams] = useSearchParams();
  const fakeDataParam: string | null = searchParams.get('fakedata');

  // TODO: Populate store with real data or fake data pased on URL params
  useEffect(() => {
    if (fakeDataParam === 'true') {
      dispatch(switchToFakeData());
    }
  }, [fakeDataParam]);

  const sectionStyles = SearchContainerStyles(themeMode, compareView);

  const location = useLocation();
  const { dispatchFetchCompareResults } = useFetchCompareResults();
  const { searchByRevisionOrEmail } = useHandleChangeSearch();

  useEffect(() => {
    document.title = title;
  }, [title]);

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(location.search);
    const repos = urlSearchParams.get('repos')?.split(',');
    const revs = urlSearchParams.get('revs')?.split(',');

    if (revs && repos) {
      void dispatchFetchCompareResults(repos as Repository['name'][], revs);

      /*
      On component mount, use the repos and revs in hash to search for the base and new revisions. Store the results in state via the SelectedRevisionsSlice: see extra reducer, fetchRevisionsByID. Now can always display the selected revisions despite page refresh or copying and pasting url
      */
      revs.forEach((rev, index) => {
        void searchByRevisionOrEmail(
          repos[index] as Repository['name'],
          rev,
          'base',
        );
        void searchByRevisionOrEmail(
          repos[index] as Repository['name'],
          rev,
          'new',
        );
      });
    }
  }, []);

  /* editing the revisions requires fetching the recent revisions in results view
   */
  useEffect(() => {
    const repository = repositoryBase;
    void dispatch(
      fetchRecentRevisions({
        repository,
        searchType: 'base' as InputType,
      }),
    );
  }, []);

  useEffect(() => {
    const repository = repositoryNew;
    void dispatch(
      fetchRecentRevisions({
        repository,
        searchType: 'new' as InputType,
      }),
    );
  }, []);

  return (
    <div
      className={styles.container}
      data-testid='beta-version-compare-results'
    >
      <PerfCompareHeader
        themeMode={themeMode}
        toggleColorMode={toggleColorMode}
        view={compareView as View}
      />
      <section className={sectionStyles.container}>
        <CompareWithBase mode={themeMode} view={compareView as View} />
      </section>
      <Grid container alignItems='center' justifyContent='center'>
        <Grid item xs={12}>
          <ResultsMain themeMode={themeMode} />
        </Grid>
      </Grid>
    </div>
  );
}

export default ResultsView;
