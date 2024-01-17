import { useState, useEffect, Dispatch, SetStateAction } from 'react';

import Box from '@mui/material/Box';
import List from '@mui/material/List';

import { searchView, compareView } from '../../common/constants';
import { useAppSelector } from '../../hooks/app';
import { SelectRevsStyles } from '../../styles';
import { InputType, Repository, RevisionsList } from '../../types/state';
import SelectedRevisionItem from './SelectedRevisionItem';

interface InProgressState {
  revs: RevisionsList[];
  repos: Repository['name'][];
  isInProgress: boolean;
}
interface SelectedRevisionsProps {
  searchType: InputType;
  isWarning?: boolean;
  formIsDisplayed: boolean;
  staging: RevisionsState;
  inProgress: InProgressState;
  isEditable: boolean;
  mode: ThemeMode;
  isWarning: boolean;
  setInProgress: Dispatch<SetStateAction<InProgressState>>;
}

// you will display the staging or in progress revisions and repos depending on the mode
interface RevisionsState {
  revs: RevisionsList[];
  repos: Repository['name'][];
}

function SelectedRevisions({
  searchType,
  isWarning,
  formIsDisplayed,
  staging,
  inProgress,
  isEditable,
  mode,
  isWarning,
  setInProgress,
}: SelectedRevisionsProps) {
  const mode = useAppSelector((state) => state.theme.mode);
  const styles = SelectRevsStyles(mode);
  const searchType = isBase ? 'base' : 'new';
  //Selected revisions handles the display of the staging or in progress revisions and repos depending on the state
  const [displayedRevisions, setDisplayedRevisions] = useState<RevisionsState>({
    revs: staging.revs,
    repos: staging.repos,
  });

  useEffect(() => {
    if (inProgress.isInProgress) {
      setDisplayedRevisions(inProgress);
    } else {
      setDisplayedRevisions(staging);
    }
  }, [inProgress, staging]);

  return (
    <Box
      className={`${styles.box} ${searchType}-box`}
      data-testid={`selected-revs-${
        isEditable ? '--editable-revisions' : '--search-revisions'
      }`}
    >
      <List>
        {revisions.map((item, index) => (
          <SelectedRevisionItem
            key={item.id}
            index={index}
            item={item}
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
