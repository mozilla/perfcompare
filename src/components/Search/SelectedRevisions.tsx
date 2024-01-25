import Box from '@mui/material/Box';
import List from '@mui/material/List';

import { searchView, compareView } from '../../common/constants';
import { useAppSelector } from '../../hooks/app';
import { SelectRevsStyles } from '../../styles';
import { InputType, Repository, RevisionsList } from '../../types/state';
import SelectedRevisionItem from './SelectedRevisionItem';

interface SelectedRevisionsProps {
  searchType: InputType;
  isWarning?: boolean;
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
  searchType,
  isWarning,
  formIsDisplayed,
  isEditable,
  mode,
  isWarning,
  displayedRevisions,
  handleRemoveEditViewRevision,
}: SelectedRevisionsProps) {
  const mode = useAppSelector((state) => state.theme.mode);
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
            isBase={isBase}
            onEditRemove={handleRemoveEditViewRevision}
          />
        ))}
      </List>
    </Box>
  );
}

export default SelectedRevisions;
