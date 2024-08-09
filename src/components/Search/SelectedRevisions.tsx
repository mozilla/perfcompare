import Box from '@mui/material/Box';
import List from '@mui/material/List';

import { useAppSelector } from '../../hooks/app';
import { SelectRevsStyles } from '../../styles';
import { Changeset } from '../../types/state';
import SelectedRevisionItem from './SelectedRevisionItem';

interface SelectedRevisionsProps {
  isBase: boolean;
  canRemoveRevision: boolean;
  isWarning: boolean;
  displayedRevisions: Changeset[];
  onRemoveRevision: (item: Changeset) => void;
}

function SelectedRevisions({
  isBase,
  canRemoveRevision,
  isWarning,
  displayedRevisions,
  onRemoveRevision,
}: SelectedRevisionsProps) {
  const mode = useAppSelector((state) => state.theme.mode);
  const styles = SelectRevsStyles(mode);
  const searchType = isBase ? 'base' : 'new';

  const iconClassName = canRemoveRevision
    ? 'icon-close-show'
    : 'icon-close-hidden';

  return (
    <Box className={`${styles.box} ${searchType}-box`}>
      <List>
        {displayedRevisions.map((item, index) => (
          <SelectedRevisionItem
            key={item.id}
            index={index}
            item={item}
            isBase={isBase}
            isWarning={isWarning}
            onRemoveRevision={onRemoveRevision}
            iconClassName={iconClassName}
          />
        ))}
      </List>
    </Box>
  );
}

export default SelectedRevisions;
