import Box from '@mui/material/Box';
import List from '@mui/material/List';

import { SelectRevsStyles } from '../../styles';
import { Repository, RevisionsList, ThemeMode } from '../../types/state';
import SelectedRevisionItem from './SelectedRevisionItem';

interface SelectedRevisionsProps {
  isBase: boolean;
  formIsDisplayed: boolean;
  isEditable: boolean;
  mode: ThemeMode;
  isWarning: boolean;
  displayedRevisions: RevisionsState;
  handleRemoveEditViewRevision: (isBase: boolean, item: RevisionsList) => void;
}

interface RevisionsState {
  revs: RevisionsList[];
  repos: Repository['name'][];
}

function SelectedRevisions({
  isBase,
  formIsDisplayed,
  isEditable,
  mode,
  isWarning,
  displayedRevisions,
  handleRemoveEditViewRevision,
}: SelectedRevisionsProps) {
  const styles = SelectRevsStyles(mode);
  const searchType = isBase ? 'base' : 'new';

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
            formIsDisplayed={formIsDisplayed}
            isEditable={isEditable}
            isBase={isBase}
            mode={mode}
            isWarning={isWarning}
            onEditRemove={handleRemoveEditViewRevision}
          />
        ))}
      </List>
    </Box>
  );
}

export default SelectedRevisions;
