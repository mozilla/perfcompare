import { useEffect } from 'react';

import type { Theme } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useLocation } from 'react-router-dom';
import { style } from 'typestyle';

import useFetchCompareResults from '../../../hooks/useFetchCompareResults';
import useHandleChangeSearch from '../../../hooks/useHandleChangeSearch';
import { SearchContainerStyles } from '../../../styles';
import { background } from '../../../styles';
import { Repository } from '../../../types/state';
import CompareWithBase from '../../Search/CompareWithBase';
import PerfCompareHeader from '../../Shared/PerfCompareHeader';
import ResultsMain from './ResultsMain';

interface ResultsViewProps {
  protocolTheme: Theme;
  toggleColorMode: () => void;
}

function ResultsView(props: ResultsViewProps) {
  const { protocolTheme, toggleColorMode } = props;
  const themeMode = protocolTheme.palette.mode;
  const view = 'compare-results';
  const styles = {
    container: style({
      backgroundColor: background(themeMode),
    }),
  };

  const sectionStyles = SearchContainerStyles(themeMode, view);

  const location = useLocation();
  const { dispatchFetchCompareResults } = useFetchCompareResults();
  const { searchByRevisionOrEmail } = useHandleChangeSearch();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const repos = searchParams.get('repos')?.split(',');
    const revs = searchParams.get('revs')?.split(',');
    void dispatchFetchCompareResults(repos as Repository['name'][], revs);

    if (revs && repos) {
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

  return (
    <div
      className={styles.container}
      data-testid='beta-version-compare-results'
    >
      <PerfCompareHeader
        themeMode={themeMode}
        toggleColorMode={toggleColorMode}
        view='compare-results'
      />
      <section className={sectionStyles.container}>
        <CompareWithBase mode={themeMode} view={view} />
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
