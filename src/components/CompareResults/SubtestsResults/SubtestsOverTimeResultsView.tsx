import { useEffect } from 'react';

import Grid from '@mui/material/Grid';
// import { useLoaderData } from 'react-router-dom';
import { style } from 'typestyle';

import { useAppSelector } from '../../../hooks/app';
import { background } from '../../../styles';
// import { SearchContainerStyles, background } from '../../../styles';
// import CompareOverTime from '../../Search/CompareOverTime';
// import { LinkToHome } from '../../Shared/LinkToHome';
import PerfCompareHeader from '../../Shared/PerfCompareHeader';
// import type { LoaderReturnValue } from '.././overTimeLoader';
import SubtestsResultsMain from './SubtestsResultsMain';

interface SubtestsResultsViewProps {
  title: string;
}
function SubtestsResultsView(props: SubtestsResultsViewProps) {
  //   const {
  //     newRevsInfo,
  //     frameworkId,
  //     intervalValue,
  //     baseRepo,
  //     newRepos,
  //   } = useLoaderData() as LoaderReturnValue;
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
      data-testid='beta-version-compare-overtime-subtests-results'
    >
      <PerfCompareHeader />
      {/* <section className={sectionStyles.container}>
        <LinkToHome />
        <CompareOverTime
          hasEditButton={true}
          newRevs={newRevsInfo ?? []}
          isBaseSearch={true}
          expandBaseComponent={() => null}
          frameworkIdVal={frameworkId}
          intervalValue={intervalValue}
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
