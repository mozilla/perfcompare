import { useState, useEffect, useContext } from 'react';

import Box from '@mui/material/Box';
import List from '@mui/material/List';

import { SelectRevsStyles } from '../../styles';
import { InputType, Repository, RevisionsList } from '../../types/state';
import CompareWithBaseContext from './CompareWithBaseContext';
import SelectedRevisionItem from './SelectedRevisionItem';
interface SelectedRevisionsProps {
  searchType: InputType;
  formIsDisplayed: boolean;
}

// you will display the staging or in progress revisions and repos depending on the mode
interface RevisionsState {
  revs: RevisionsList[];
  repos: Repository['name'][];
}

function SelectedRevisions({
  searchType,
  formIsDisplayed,
}: SelectedRevisionsProps) {
  const {
    isEditable,
    mode,
    baseStaging,
    newStaging,
    baseInProgress,
    newInProgress,
  } = useContext(CompareWithBaseContext);

  const styles = SelectRevsStyles(mode);
  //Selected revisions handles the display of the staging or in progress revisions and repos depending on the state
  const [displayedRevisions, setDisplayedRevisions] = useState<RevisionsState>({
    revs: baseStaging.revs,
    repos: baseStaging.repos,
  });

  useEffect(() => {
    if (searchType === 'base' && !baseInProgress.isInProgress) {
      setDisplayedRevisions(baseStaging);
    }

    if (searchType === 'new' && !newInProgress.isInProgress) {
      setDisplayedRevisions(newStaging);
    }

    if (baseInProgress.isInProgress && searchType === 'base') {
      setDisplayedRevisions(baseInProgress);
    }

    if (newInProgress.isInProgress && searchType === 'new') {
      setDisplayedRevisions(newInProgress);
    }
  }, [
    displayedRevisions,
    baseInProgress,
    newInProgress,
    baseStaging,
    newStaging,
    searchType,
  ]);

  return (
    <Box
      className={`${styles.box} ${searchType}-box`}
      data-testid={`selected-revs-${
        isEditable ? '--editable-revisions' : '--search-revisions'
      }`}
    >
      <List>
        {displayedRevisions.revs.map((item, index) => (
          <SelectedRevisionItem
            key={item.id}
            index={index}
            item={item}
            repository={displayedRevisions.repos[index]}
            searchType={searchType}
            formIsDisplayed={formIsDisplayed}
          />
        ))}
      </List>
    </Box>
  );
}

export default SelectedRevisions;
