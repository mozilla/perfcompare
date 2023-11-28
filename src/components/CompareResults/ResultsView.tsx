import { useEffect } from 'react';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { useSearchParams } from 'react-router-dom';
import { style } from 'typestyle';

import { compareView, frameworkMap, repoMap } from '../../common/constants';
import { useAppDispatch, useAppSelector } from '../../hooks/app';
import useFetchCompareResults from '../../hooks/useFetchCompareResults';
import useHandleChangeSearch from '../../hooks/useHandleChangeSearch';
import { updateFramework } from '../../reducers/FrameworkSlice';
import { SearchContainerStyles, background } from '../../styles';
import { Repository, View } from '../../types/state';
import { Framework } from '../../types/types';
import CompareWithBase from '../Search/CompareWithBase';
import SearchViewInit from '../Search/SearchViewInit';
import PerfCompareHeader from '../Shared/PerfCompareHeader';
import ResultsMain from './ResultsMain';

interface ResultsViewProps {
  title: string;
}
function ResultsView(props: ResultsViewProps) {
  const dispatch = useAppDispatch();
  const selectedRevisionsListBase = useAppSelector(
    (state) => state.selectedRevisions.base,
  );
  const selectedRevisionsListNew = useAppSelector(
    (state) => state.selectedRevisions.new,
  );

  // The "??" operations below are so that Typescript doesn't wonder about the
  // undefined value later.
  const selectedBaseRepositories = selectedRevisionsListBase.map(
    (item) => repoMap[item.repository_id] ?? 'try',
  );
  const selectedNewRepositories = selectedRevisionsListNew.map(
    (item) => repoMap[item.repository_id] ?? 'try',
  );

  const { dispatchFetchCompareResults, dispatchFakeCompareResults } =
    useFetchCompareResults();
  const { searchRecentRevisions } = useHandleChangeSearch();

  const { title } = props;
  const themeMode = useAppSelector((state) => state.theme.mode);
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
       *On component mount, use the repos and revs in hash to search for the base and new *revisions. Store the results in state via the SelectedRevisionsSlice: see extra *reducer, fetchRevisionsByID. Now can always display the selected revisions despite *page refresh or copying and pasting url
       */
      revsArray.forEach((rev, index) => {
        void searchRecentRevisions(
          reposArray[index] as Repository['name'],
          rev,
          'base',
        );
        void searchRecentRevisions(
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

  return (
    <div
      className={styles.container}
      data-testid='beta-version-compare-results'
    >
      <PerfCompareHeader view={compareView as View} />
      <section className={sectionStyles.container}>
        <Link href='/' aria-label='link to home'>
          <Stack direction='row' alignItems='center'>
            <ChevronLeftIcon fontSize='small' />
            <p>Home</p>
          </Stack>
        </Link>
        <SearchViewInit />

        <CompareWithBase
          isEditable={true}
          baseRevs={selectedRevisionsListBase}
          newRevs={selectedRevisionsListNew}
          baseRepos={selectedBaseRepositories}
          newRepos={selectedNewRepositories}
        />
      </section>
      <Grid container alignItems='center' justifyContent='center'>
        <Grid item xs={12}>
          <ResultsMain />
        </Grid>
      </Grid>
    </div>
  );
}

export default ResultsView;
