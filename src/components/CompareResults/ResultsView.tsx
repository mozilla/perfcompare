import { useEffect, useState } from 'react';

import Grid from '@mui/material/Grid';
import { useLoaderData } from 'react-router-dom';
import { style } from 'typestyle';

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
    useLoaderData() as LoaderReturnValue;

  const newRepo = newRepos[0];
  const { title } = props;
  const themeMode = useAppSelector((state) => state.theme.mode);
  const styles = {
    container: style({
      backgroundColor: background(themeMode),
    }),
  };

  const sectionStyles = SearchContainerStyles(themeMode, /* isHome */ false);

  const [editTitleInput, showEditTitleInput] = useState(false);

  const handleEditInputToggle = () => {
    showEditTitleInput(!editTitleInput);
  };

  const onValueChange = (value: string) => {
    console.log(value);
    //add logic to save in the url
  };

  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div
      className={styles.container}
      data-testid='beta-version-compare-results'
    >
      <PerfCompareHeader
        isHome={false}
        handleShowInput={handleEditInputToggle}
        editTitleInput={editTitleInput}
        onChange={onValueChange}
      />

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

      <Grid container alignItems='center' justifyContent='center'>
        <Grid item xs={12}>
          <ResultsMain />
        </Grid>
      </Grid>
    </div>
  );
}

export default ResultsView;
