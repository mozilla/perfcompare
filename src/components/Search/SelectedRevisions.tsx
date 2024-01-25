import Box from '@mui/material/Box';
import List from '@mui/material/List';

import { SelectRevsStyles } from '../../styles';
import { Repository, RevisionsList, ThemeMode } from '../../types/state';
import SelectedRevisionItem from './SelectedRevisionItem';
import useCheckRevision from '../../hooks/useCheckRevision';

interface SelectedRevisionsProps {
  isBase: boolean;
  formIsDisplayed: boolean;
  isEditable: boolean;
  mode: ThemeMode;
  isWarning: boolean;
  displayedRevisions: RevisionsState;
  onEditRemove: (item: RevisionsList) => void;
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
  onEditRemove,
}: SelectedRevisionsProps) {
  const styles = SelectRevsStyles(mode);
  const searchType = isBase ? 'base' : 'new';

  const onEditRemoveAction = (item: RevisionsList) => {
    onEditRemove(item);
  };

  const { removeCheckedRevision } = useCheckRevision(isBase, isEditable);

  const handleRemoveRevision = (item: RevisionsList) => {
    removeCheckedRevision(item);
  };
  const removeRevision = (item: RevisionsList) => {
    if (isEditable) {
      onEditRemoveAction(item);
    } else {
      handleRemoveRevision(item);
    }
  };

  const iconClassName =
    !formIsDisplayed && isEditable
      ? 'icon icon-close-hidden'
      : 'icon icon-close-show';

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
            isBase={isBase}
            mode={mode}
            isWarning={isWarning}
            removeRevision={removeRevision}
            iconClassName={iconClassName}
          />
        ))}
      </List>
    </Box>
  );
}

export default SelectedRevisions;
