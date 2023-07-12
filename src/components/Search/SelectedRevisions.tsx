import { useEffect } from 'react';

import Box from '@mui/material/Box';
import List from '@mui/material/List';

import { repoMap } from '../../common/constants';
import { RootState } from '../../common/store';
import { useAppSelector, useAppDispatch } from '../../hooks/app';
import { clearCheckedRevisions } from '../../reducers/SearchSlice';
import { SelectRevsStyles } from '../../styles';
import { InputType } from '../../types/state';
import SelectedRevisionItem from './SelectedRevisionItem';

interface SelectedRevisionsProps {
  mode: 'light' | 'dark';
  searchType: InputType;
  isWarning: boolean;
}

function SelectedRevisions({
  mode,
  searchType,
  isWarning,
}: SelectedRevisionsProps) {
  const dispatch = useAppDispatch();
  const styles = SelectRevsStyles(mode);
  const checkedRevisionsList = useAppSelector(
    (state: RootState) => state.search[searchType].checkedRevisions,
  );

  const selectedRevisions = useAppSelector(
    (state: RootState) => state.selectedRevisions.revisions,
  );

  const displayedSelectedRevisions = useAppSelector(
    (state: RootState) => state.selectedRevisions[searchType],
  );

  const repository = checkedRevisionsList.map((item) => {
    const selectedRep = repoMap[item.repository_id];
    return selectedRep;
  });

  const selectedRevRepo = selectedRevisions?.map((item) => {
    const selectedRep = repoMap[item.repository_id];
    return selectedRep;
  });

  useEffect(() => {
    if (selectedRevisions?.length) {
      dispatch(clearCheckedRevisions());
    }
  }, [dispatch]);

  return (
    <Box className={styles.box} data-testid='selected-revs'>
      <List>
        {checkedRevisionsList.length > 0 &&
          checkedRevisionsList.map((item, index) => (
            <SelectedRevisionItem
              key={item.id}
              index={index}
              item={item}
              mode={mode}
              repository={repository[index]}
              searchType={searchType}
              isWarning={isWarning}
            />
          ))}

        {displayedSelectedRevisions.length > 0 &&
          displayedSelectedRevisions.map((item, index) => (
            <SelectedRevisionItem
              key={item.id}
              index={index}
              item={item}
              mode={mode}
              repository={selectedRevRepo && selectedRevRepo[index]}
              searchType={searchType}
              isWarning={isWarning}
            />
          ))}
      </List>
    </Box>
  );
}

export default SelectedRevisions;
