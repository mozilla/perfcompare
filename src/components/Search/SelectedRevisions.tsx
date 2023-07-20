import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import List from '@mui/material/List';

import { repoMap } from '../../common/constants';
import { RootState } from '../../common/store';
import { useAppSelector } from '../../hooks/app';
import { SelectRevsStyles } from '../../styles';
import {
  InputType,
  ViewType,
  RevisionsList,
  Repository,
  ModeType,
} from '../../types/state';
import SelectedRevisionItem from './SelectedRevisionItem';

interface SelectedRevisionsProps {
  mode: ModeType;
  searchType: InputType;
  isWarning: boolean;
  view: ViewType;
}

function SelectedRevisions({
  mode,
  searchType,
  isWarning,
  view,
}: SelectedRevisionsProps) {
  const styles = SelectRevsStyles(mode);
  const [revisions, setRevisions] = useState<RevisionsList[]>([]);
  const [repositories, setRepositories] = useState<Repository['name'][]>([]);
  const checkedRevisionsList = useAppSelector(
    (state: RootState) => state.search[searchType].checkedRevisions,
  );

  const selectedRevisions = useAppSelector(
    (state: RootState) => state.selectedRevisions.revisions,
  );

  const displayedSelectedRevisions = useAppSelector(
    (state: RootState) => state.selectedRevisions[searchType],
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
    if (view == 'search') {
      setRevisions(checkedRevisionsList);
      setRepositories(checkedRepositories as Repository['name'][]);
    }

    if (view == 'compare-results') {
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
          />
        ))}
      </List>
    </Box>
  );
}

export default SelectedRevisions;
