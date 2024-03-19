import Box from '@mui/material/Box';
import List from '@mui/material/List';

import { useAppSelector } from '../../hooks/app';
import useCheckRevision from '../../hooks/useCheckRevision';
import { SelectRevsStyles } from '../../styles';
import { Changeset } from '../../types/state';
import SelectedRevisionItem from './SelectedRevisionItem';

interface SelectedRevisionsProps {
  isBase: boolean;
  canRemoveRevision: boolean;
  hasNonEditableState: boolean;
  isWarning: boolean;
  displayedRevisions: Changeset[];
  onEditRemove: (item: Changeset) => void;
}

function SelectedRevisions({
  isBase,
  canRemoveRevision,
  hasNonEditableState,
  isWarning,
  displayedRevisions,
  onEditRemove,
}: SelectedRevisionsProps) {
  const mode = useAppSelector((state) => state.theme.mode);
  const styles = SelectRevsStyles(mode);
  const searchType = isBase ? 'base' : 'new';

  const onEditRemoveAction = (item: Changeset) => {
    onEditRemove(item);
  };

  const { removeCheckedRevision } = useCheckRevision(
    isBase,
    hasNonEditableState,
  );

  const handleRemoveRevision = (item: Changeset) => {
    removeCheckedRevision(item);
  };
  const removeRevision = (item: Changeset) => {
    if (hasNonEditableState) {
      onEditRemoveAction(item);
    } else {
      handleRemoveRevision(item);
    }
  };

  const iconClassName = canRemoveRevision
    ? 'icon-close-show'
    : 'icon-close-hidden';

  return (
    <Box
      className={`${styles.box} ${searchType}-box`}
      data-testid={`selected-revs-${
        hasNonEditableState ? '--editable-revisions' : '--search-revisions'
      }`}
    >
      <List>
        {displayedRevisions.map((item, index) => (
          <SelectedRevisionItem
            key={item.id}
            index={index}
            item={item}
            isBase={isBase}
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
