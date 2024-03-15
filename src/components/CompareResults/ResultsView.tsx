import { useEffect, useMemo } from 'react';

import Grid from '@mui/material/Grid';
import { useLoaderData } from 'react-router-dom';
import { style } from 'typestyle';

import { useAppDispatch, useAppSelector } from '../../hooks/app';
import { updateFramework } from '../../reducers/FrameworkSlice';
import { SearchContainerStyles, background } from '../../styles';
import CompareWithBase from '../Search/CompareWithBase';
import SearchViewInit from '../Search/SearchViewInit';
import { LinkToHome } from '../Shared/LinkToHome';
import PerfCompareHeader from '../Shared/PerfCompareHeader';
import type { LoaderReturnValue } from './loader';
import ResultsMain from './ResultsMain';

interface ResultsViewProps {
  title: string;
}
function ResultsView(props: ResultsViewProps) {
  const dispatch = useAppDispatch();
  const { baseRevInfo, newRevsInfo, frameworkId, frameworkName } =
    useLoaderData() as LoaderReturnValue;

  // The CompareWithBase component wants arrays. So that we keep the same array
  // reference if the data doesn't change, we use `useMemo` for these 2 variables.
  const baseRevInfos = useMemo(
    () => (baseRevInfo ? [baseRevInfo] : []),
    [baseRevInfo],
  );

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

  // TODO in the future we'll pass the framework information to CompareWithBase
  // as a prop instead of using the redux store.
  useEffect(() => {
    dispatch(
      updateFramework({
        id: frameworkId,
        name: frameworkName,
      }),
    );
  }, [frameworkId, frameworkName]);

  return (
    <div
      className={styles.container}
      data-testid='beta-version-compare-results'
    >
      <PerfCompareHeader />
      <section className={sectionStyles.container}>
        <LinkToHome />
        <SearchViewInit />

        <CompareWithBase
          hasNonEditableState={true}
          baseRevs={baseRevInfos}
          newRevs={newRevsInfo ?? []}
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
