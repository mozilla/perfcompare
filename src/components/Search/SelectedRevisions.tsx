import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import { useLocation } from 'react-router-dom';

import { repoMap, searchView, compareView } from '../../common/constants';
import { useAppSelector } from '../../hooks/app';
import { SelectRevsStyles } from '../../styles';
import {
  InputType,
  Repository,
  ThemeMode,
  RevisionsList,
} from '../../types/state';
import SelectedRevisionItem from './SelectedRevisionItem';
interface SelectedRevisionsProps {
  mode: ThemeMode;
  searchType: InputType;
  isWarning?: boolean;
  formIsDisplayed: boolean;
  isEditable: boolean;
}

function SelectedRevisions({
  mode,
  searchType,
  isWarning,
  formIsDisplayed,
  isEditable,
}: SelectedRevisionsProps) {
  const styles = SelectRevsStyles(mode);
  const location = useLocation();
  const view = location.pathname == '/' ? searchView : compareView;
  const [revisions, setRevisions] = useState<RevisionsList[]>([]);
  const [repositories, setRepositories] = useState<Repository['name'][]>([]);
  const checkedRevisionsList = useAppSelector(
    (state) => state.search[searchType].checkedRevisions,
  );

  const checkedRepositories = checkedRevisionsList.map((item) => {
    const selectedRep = repoMap[item.repository_id];
    return selectedRep;
  });
  const selectedRevisions = useAppSelector(
    (state) => state.selectedRevisions.revisions,
  );
  const compareViewRepositories = selectedRevisions.map((item) => {
    const selectedRep = repoMap[item.repository_id];
    return selectedRep;
  });
  const compareViewSelectedRevisions = useAppSelector(
    (state) => state.selectedRevisions[searchType],
  );

  useEffect(() => {
    if (view === searchView) {
      setRevisions(checkedRevisionsList);
      setRepositories(checkedRepositories as Repository['name'][]);
    } else {
      setRevisions(compareViewSelectedRevisions);
      setRepositories(compareViewRepositories as Repository['name'][]);
    }
  }, [checkedRevisionsList, selectedRevisions]);

  return (
    <Box
      className={`${styles.box} ${searchType}-box`}
      data-testid={`selected-revs-${view}`}
    >
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
            formIsDisplayed={formIsDisplayed}
            isEditable={isEditable}
          />
        ))}
      </List>
    </Box>
  );
}

export default SelectedRevisions;
