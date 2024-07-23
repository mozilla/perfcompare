import { useEffect } from 'react';

import Grid from '@mui/material/Grid';
// import { useLoaderData } from 'react-router-dom';
import { style } from 'typestyle';

import { useAppSelector } from '../../../hooks/app';
import { background } from '../../../styles';
// import { SearchContainerStyles, background } from '../../../styles';
// import CompareWithBase from '../../Search/CompareWithBase';
// import { LinkToHome } from '../../Shared/LinkToHome';
import PerfCompareHeader from '../../Shared/PerfCompareHeader';
// import type { LoaderReturnValue } from '.././loader';
import SubtestsResultsMain from './SubtestsResultsMain';

interface ResultsViewProps {
  title: string;
}
function SubtestsResultsView(props: ResultsViewProps) {
  //   const { baseRevInfo, newRevsInfo, frameworkId, baseRepo, newRepos } =
  //     useLoaderData() as LoaderReturnValue;

  //   const newRepo = newRepos[0];
  const { title } = props;
  const themeMode = useAppSelector((state) => state.theme.mode);
  const styles = {
    container: style({
      backgroundColor: background(themeMode),
    }),
  };

  //   const sectionStyles = SearchContainerStyles(themeMode, /* isHome */ false);

  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div
      className={styles.container}
      data-testid='beta-version-compare-subtests-results'
    >
      <PerfCompareHeader />
      {/* <section className={sectionStyles.container}>
        <LinkToHome />
        <CompareWithBase
          hasEditButton={true}
          baseRev={baseRevInfo ?? null}
          newRevs={newRevsInfo ?? []}
          frameworkIdVal={frameworkId}
          isBaseSearch={null}
          expandBaseComponent={() => null}
          baseRepo={baseRepo}
          newRepo={newRepo}
        />
      </section> */}

      <Grid container alignItems='center' justifyContent='center'>
        <Grid item xs={12}>
          <SubtestsResultsMain />
        </Grid>
      </Grid>
    </div>
  );
}

export default SubtestsResultsView;
