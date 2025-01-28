import { useEffect, useState } from 'react';

import Grid from '@mui/material/Grid';
import { style } from 'typestyle';

import SubtestsResultsMain from './SubtestsResultsMain';
import { subtestsView } from '../../../common/constants';
import { useAppSelector } from '../../../hooks/app';
import { background } from '../../../styles';
import PerfCompareHeader from '../../Shared/PerfCompareHeader';

interface ResultsViewProps {
  title: string;
}
function SubtestsResultsView(props: ResultsViewProps) {
  const { title } = props;
  const themeMode = useAppSelector((state) => state.theme.mode);
  const styles = {
    container: style({
      backgroundColor: background(themeMode),
    }),
  };

  useEffect(() => {
    document.title = title;
  }, [title]);

  const [editTitleInput, showEditTitleInput] = useState(false);

  const handleEditInputToggle = () => {
    showEditTitleInput(!editTitleInput);
  };

  const onValueChange = (value: string) => {
    console.log(value);
    //add logic to save in the url
  };

  return (
    <div
      className={styles.container}
      data-testid='beta-version-compare-subtests-results'
    >
      <PerfCompareHeader
        handleShowInput={handleEditInputToggle}
        editTitleInput={editTitleInput}
        onChange={onValueChange}
      />
      <Grid container alignItems='center' justifyContent='center'>
        <Grid item xs={12}>
          <SubtestsResultsMain view={subtestsView} />
        </Grid>
      </Grid>
    </div>
  );
}

export default SubtestsResultsView;
