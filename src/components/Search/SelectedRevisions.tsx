import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import List from '@mui/material/List';

import { repoMap, searchView } from '../../common/constants';
import { useAppSelector } from '../../hooks/app';
import { SelectRevsStyles } from '../../styles';
import {
  InputType,
  View,
  RevisionsList,
  Repository,
  ThemeMode,
} from '../../types/state';
import SelectedRevisionItem from './SelectedRevisionItem';

interface SelectedRevisionsProps {
  mode: ThemeMode;
  searchType: InputType;
  isWarning: boolean;
  view: View;
  editBtnVisible?: boolean;
}

function SelectedRevisions({
  mode,
  searchType,
  isWarning,
  view,
  editBtnVisible,
}: SelectedRevisionsProps) {
  const styles = SelectRevsStyles(mode);
  const [revisions, setRevisions] = useState<RevisionsList[]>([]);
  const [repositories, setRepositories] = useState<Repository['name'][]>([]);
  const checkedRevisionsList = useAppSelector(
    (state) => state.search[searchType].checkedRevisions,
  );

  const selectedRevisions = useAppSelector(
    (state) => state.selectedRevisions.revisions,
  );

  const displayedSelectedRevisions = useAppSelector(
    (state) => state.selectedRevisions[searchType],
  );

  const checkedRepositories = checkedRevisionsList.map((item) => {
    const selectedRep = repoMap[item.repository_id];
    return selectedRep;
  });

  const selectedRevRepo = selectedRevisions.map((item) => {
    const selectedRep = repoMap[item.repository_id];
    return selectedRep;
  });

  useEffect(() => {
    if (view === searchView || !editBtnVisible) {
      setRevisions(checkedRevisionsList);
      setRepositories(checkedRepositories as Repository['name'][]);
    } else {
      setRevisions(displayedSelectedRevisions);
      setRepositories(selectedRevRepo as Repository['name'][]);
    }
  }, [checkedRevisionsList, selectedRevisions]);

  return (
    <Box className={styles.box} data-testid={`selected-revs-${view}`}>
      <List>
        {revisions.map((item, index) => (
          <SelectedRevisionItem
            key={item.id}
            index={index}
            item={item}
            mode={mode}
            repository={repositories[index]}
            searchType={searchType}
            isWarning={isWarning}
            view={view}
            editBtnVisible={editBtnVisible}
          />
        ))}
      </List>
    </Box>
  );
}

export default SelectedRevisions;
