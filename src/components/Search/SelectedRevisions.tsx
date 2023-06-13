import Box from '@mui/material/Box';
import List from '@mui/material/List';

import { repoMap } from '../../common/constants';
import { RootState } from '../../common/store';
import { useAppSelector } from '../../hooks/app';
import { SelectRevsStyles } from '../../styles';
import { InputType } from '../../types/state';
import SelectedRevisionItem from './SelectedRevisionItem';

function SelectedRevisions({ mode, searchType }: SelectedRevisionsProps) {
  const styles = SelectRevsStyles(mode);
  const checkedRevisionsList = useAppSelector(
    (state: RootState) => state.search[searchType].checkedRevisions,
  );

  const repository = checkedRevisionsList.map((item) => {
    const selectedRep = repoMap[item.repository_id];
    return selectedRep;
  });

  return (
    <Box className={styles.box} data-testid='selected-revs'>
      <List>
        {checkedRevisionsList.map((item, index) => (
          <SelectedRevisionItem
            key={item.id}
            index={index}
            item={item}
            mode={mode}
            repository={repository[index]}
            searchType={searchType}
          />
        ))}
      </List>
    </Box>
  );
}

interface SelectedRevisionsProps {
  mode: 'light' | 'dark';
  searchType: InputType;
}

export default SelectedRevisions;
