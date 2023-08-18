import { useEffect } from 'react';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import type { Theme } from '@mui/material';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { useLocation } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { style } from 'typestyle';

import { compareView } from '../../../common/constants';
import { useAppDispatch, useAppSelector } from '../../../hooks/app';
import useFetchCompareResults from '../../../hooks/useFetchCompareResults';
import useHandleChangeSearch from '../../../hooks/useHandleChangeSearch';
import { comparisonResults as secondRevisionResults } from '../../../mockData/9d5066525489';
import { comparisonResults as thirdRevisionResults } from '../../../mockData/a998c42399a8';
import { comparisonResults as firstRevisionResults } from '../../../mockData/bb6a5e451dac';
import { setCompareData } from '../../../reducers/CompareResults';
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

  const comparisonResults = {
    bb6a5e451dac: firstRevisionResults,
    '9d5066525489': secondRevisionResults,
    a998c42399a8: thirdRevisionResults,
  };

  // TODO: Populate store with real data or fake data pased on URL params
  useEffect(() => {
    if (fakeDataParam === 'true') {
      dispatch(setCompareData({ data: comparisonResults }));
    } else {
      dispatch(setCompareData({ data: {} }));
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
    const framework = urlSearchParams.get('framework');

    if (revs && repos) {
      void dispatchFetchCompareResults(
        repos as Repository['name'][],
        revs,
        framework as string,
      );

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
  }, [repositoryBase]);

  useEffect(() => {
    const repository = repositoryNew;
    void dispatch(
      fetchRecentRevisions({
        repository,
        searchType: 'new' as InputType,
      }),
    );
  }, [repositoryNew]);

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
        <Link href='/' aria-label='link to home'>
          <Stack direction='row' alignItems='center'>
            <ChevronLeftIcon fontSize='small' />
            <p>Home</p>
          </Stack>
        </Link>
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
