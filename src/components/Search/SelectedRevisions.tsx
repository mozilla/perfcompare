import Box from '@mui/material/Box';
import List from '@mui/material/List';

import { repoMap } from '../../common/constants';
import { RootState } from '../../common/store';
import { useAppSelector } from '../../hooks/app';
import { SelectRevsStyles } from '../../styles';
import { InputType } from '../../types/state';
import SelectedRevisionItem from './SelectedRevisionItem';

interface SelectedRevisionsProps {
  mode: 'light' | 'dark';
  searchType: InputType;
  isWarning: boolean;
  view: 'compare-results' | 'search';
}

function SelectedRevisions({
  mode,
  searchType,
  isWarning,
  view,
}: SelectedRevisionsProps) {
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

  const selectedRevRepo = selectedRevisions.map((item) => {
    const selectedRep = repoMap[item.repository_id];
    return selectedRep;
  });

  return (
    <Box className={styles.box} data-testid='selected-revs'>
      <List>
        {view == 'search' &&
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

        {view == 'compare-results' &&
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
