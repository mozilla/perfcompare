import { useEffect } from 'react';

import Grid from '@mui/material/Grid';
import { useLoaderData } from 'react-router';
import { style } from 'typestyle';

import type { HashLoaderReturnValue } from './hashToCommitLoader';
import type { LandoLoaderReturnValue } from './landoToCommitLoader';
import type { LoaderReturnValue } from './loader';
import ResultsMain from './ResultsMain';
import { useAppSelector } from '../../hooks/app';
import { SearchContainerStyles, background } from '../../styles';
import CompareWithBase from '../Search/CompareWithBase';
import { LinkToHome } from '../Shared/LinkToHome';
import PerfCompareHeader from '../Shared/PerfCompareHeader';

interface ResultsViewProps {
  title: string;
}
function ResultsView(props: ResultsViewProps) {
  const { baseRevInfo, newRevsInfo, frameworkId, baseRepo, newRepos } =
    useLoaderData() as
      | LoaderReturnValue
      | HashLoaderReturnValue
      | LandoLoaderReturnValue;

  const newRepo = newRepos[0];
  const { title } = props;
  const themeMode = useAppSelector((state) => state.theme.mode);
  const styles = {
    container: style({
      backgroundColor: background(themeMode),
    }),
  };

  const sectionStyles = SearchContainerStyles(themeMode, /* isHome */ false);

  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div
      className={styles.container}
      data-testid='beta-version-compare-results'
    >
      <PerfCompareHeader />
      <section className={sectionStyles.container}>
        <LinkToHome />
        <CompareWithBase
          hasEditButton={true}
          baseRev={baseRevInfo ?? null}
          newRevs={newRevsInfo ?? []}
          frameworkIdVal={frameworkId}
          isExpanded={true}
          baseRepo={baseRepo}
          newRepo={newRepo}
        />
      </section>
      <Grid
        container
        sx={{
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Grid size={12}>
          <ResultsMain />
        </Grid>
      </Grid>
    </div>
  );
}

export default ResultsView;
