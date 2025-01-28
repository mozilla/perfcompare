import { useEffect, useState } from 'react';

import Grid from '@mui/material/Grid';
import { useLoaderData } from 'react-router-dom';
import { style } from 'typestyle';

import type { LoaderReturnValue } from './overTimeLoader';
import ResultsMain from './ResultsMain';
import { useAppSelector } from '../../hooks/app';
import { SearchContainerStyles, background } from '../../styles';
import CompareOverTime from '../Search/CompareOverTime';
import { LinkToHome } from '../Shared/LinkToHome';
import PerfCompareHeader from '../Shared/PerfCompareHeader';

interface ResultsViewProps {
  title: string;
}
function ResultsView(props: ResultsViewProps) {
  const { newRevsInfo, frameworkId, intervalValue, baseRepo, newRepos } =
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
  const [editTitleInputVisible, showEditTitleInput] = useState(false);

  const handleEditInputToggle = () => {
    showEditTitleInput(!editTitleInputVisible);
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
      data-testid='beta-version-compare-overtime-results'
    >
      <PerfCompareHeader
        handleShowInput={handleEditInputToggle}
        editTitleInputVisible={editTitleInputVisible}
        onChange={onValueChange}
      />
      <section className={sectionStyles.container}>
        <LinkToHome />
        <CompareOverTime
          hasEditButton={true}
          newRevs={newRevsInfo ?? []}
          isExpanded={true}
          frameworkIdVal={frameworkId}
          intervalValue={intervalValue}
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
