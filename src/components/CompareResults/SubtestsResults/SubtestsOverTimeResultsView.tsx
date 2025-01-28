import { useEffect, useState } from 'react';

import Grid from '@mui/material/Grid';
import { style } from 'typestyle';

import SubtestsResultsMain from './SubtestsResultsMain';
import { subtestsOverTimeView } from '../../../common/constants';
import { useAppSelector } from '../../../hooks/app';
import { background } from '../../../styles';
import PerfCompareHeader from '../../Shared/PerfCompareHeader';

interface SubtestsResultsViewProps {
  title: string;
}
function SubtestsResultsView(props: SubtestsResultsViewProps) {
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
    <div className={styles.container}>
      <PerfCompareHeader
        handleShowInput={handleEditInputToggle}
        editTitleInput={editTitleInput}
        onChange={onValueChange}
      />
      <Grid container alignItems='center' justifyContent='center'>
        <Grid item xs={12}>
          <SubtestsResultsMain view={subtestsOverTimeView} />
        </Grid>
      </Grid>
    </div>
  );
}

export default SubtestsResultsView;
