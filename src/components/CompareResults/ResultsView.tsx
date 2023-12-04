import { useEffect, useMemo } from 'react';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import type { Theme } from '@mui/material';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { useLoaderData } from 'react-router-dom';
import { style } from 'typestyle';

import { compareView } from '../../common/constants';
import { SearchContainerStyles } from '../../styles';
import { background } from '../../styles';
import { View } from '../../types/state';
import CompareWithBase from '../Search/CompareWithBase';
import PerfCompareHeader from '../Shared/PerfCompareHeader';
import type { LoaderReturnValue } from './loader';
import ResultsMain from './ResultsMain';

interface ResultsViewProps {
  protocolTheme: Theme;
  toggleColorMode: () => void;
  title: string;
}
function ResultsView(props: ResultsViewProps) {
  const { baseRev, baseRevInfo, baseRepo, newRevsInfo, newRepos, framework } =
    useLoaderData() as LoaderReturnValue;
  console.log(framework);

  const baseRevs = useMemo(() => (baseRevInfo ? [baseRevInfo] : []), [baseRev]);
  const baseRepos = useMemo(() => [baseRepo], [baseRepo]);

  const { protocolTheme, toggleColorMode, title } = props;
  const themeMode = protocolTheme.palette.mode;
  const styles = {
    container: style({
      backgroundColor: background(themeMode),
    }),
  };

  const sectionStyles = SearchContainerStyles(themeMode, compareView);

  useEffect(() => {
    document.title = title;
  }, [title]);

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

        <CompareWithBase
          mode={themeMode}
          isEditable={true}
          baseRevs={baseRevs}
          newRevs={newRevsInfo ?? []}
          baseRepos={baseRepos}
          newRepos={newRepos}
        />
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
