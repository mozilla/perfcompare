import { useEffect } from 'react';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import type { Theme } from '@mui/material';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { useSearchParams } from 'react-router-dom';
import { style } from 'typestyle';

import { compareView } from '../../common/constants';
import { frameworkMap } from '../../common/constants';
import { useAppDispatch, useAppSelector } from '../../hooks/app';
import useFetchCompareResults from '../../hooks/useFetchCompareResults';
import useHandleChangeSearch from '../../hooks/useHandleChangeSearch';
import { updateFramework } from '../../reducers/SearchSlice';
import { SearchContainerStyles } from '../../styles';
import { background } from '../../styles';
import { fetchRecentRevisions } from '../../thunks/searchThunk';
import { Repository, View, InputType } from '../../types/state';
import { Framework } from '../../types/types';
import CompareOverTime from '../Search/CompareOverTime';
import CompareWithBase from '../Search/CompareWithBase';
import PerfCompareHeader from '../Shared/PerfCompareHeader';
import ResultsMain from './ResultsMain';

interface ResultsViewProps {
  protocolTheme: Theme;
  toggleColorMode: () => void;
  title: string;
}
function ResultsView(props: ResultsViewProps) {
  const dispatch = useAppDispatch();
  const repositoryBase = useAppSelector(
    (state) => state.searchCompareWithBase.base.repository,
  );
  const repositoryNew = useAppSelector(
    (state) => state.searchCompareWithBase.new.repository,
  );
  const repositoryCompareOverTime = useAppSelector(
    (state) => state.searchCompareOverTime.new.repository,
  );
  const { dispatchFetchCompareResults, dispatchFakeCompareResults } =
    useFetchCompareResults();
  const { searchByRevisionOrEmail } = useHandleChangeSearch();

  const { protocolTheme, toggleColorMode, title } = props;
  const themeMode = protocolTheme.palette.mode;
  const styles = {
    container: style({
      backgroundColor: background(themeMode),
    }),
  };

  const [searchParams] = useSearchParams();
  const fakeDataParam: string | null = searchParams.get('fakedata');

  useEffect(() => {
    if (fakeDataParam === 'true') {
      dispatchFakeCompareResults();
    }
  }, [fakeDataParam]);

  const sectionStyles = SearchContainerStyles(themeMode, compareView);

  useEffect(() => {
    document.title = title;
  }, [title]);

  const repos = searchParams.get('repos');
  const revs = searchParams.get('revs');
  const framework = searchParams.get('framework');

  useEffect(() => {
    if (revs && repos) {
      const revsArray = revs.split(',');
      const reposArray = repos.split(',');
      void dispatchFetchCompareResults(
        reposArray as Repository['name'][],
        revsArray,
        framework as string,
      );

      /*
      On component mount, use the repos and revs in hash to search for the base and new revisions. Store the results in state via the SelectedRevisionsSlice: see extra reducer, fetchRevisionsByID. Now can always display the selected revisions despite page refresh or copying and pasting url
      */
      revsArray.forEach((rev, index) => {
        void searchByRevisionOrEmail(
          reposArray[index] as Repository['name'],
          rev,
          'base',
        );
        void searchByRevisionOrEmail(
          reposArray[index] as Repository['name'],
          rev,
          'new',
        );
      });
    }
  }, [repos, revs, framework]);

  useEffect(() => {
    if (framework) {
      const frameworkId = parseInt(framework);
      if (frameworkId in frameworkMap) {
        const frameworkName = frameworkMap[frameworkId as Framework['id']];
        dispatch(
          updateFramework({
            id: frameworkId,
            name: frameworkName,
          }),
        );
      }
    }
  }, [framework]);

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

  useEffect(() => {
    const repository = repositoryCompareOverTime;
    void dispatch(
      fetchRecentRevisions({
        repository,
        searchType: 'new' as InputType,
      }),
    );
  }, [repositoryCompareOverTime]);

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
        <CompareOverTime mode={themeMode} view={compareView as View} />
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
