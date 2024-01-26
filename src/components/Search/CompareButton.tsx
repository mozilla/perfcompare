import Button from '@mui/material/Button';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import useSelectRevision from '../../hooks/useSelectedRevisions';
import { Strings } from '../../resources/Strings';
import { ButtonStyles } from '../../styles';

const strings = Strings.components.searchDefault.sharedCollasped;

export default function CompareButton() {
  const mode = useAppSelector((state) => state.theme.mode);
  const { addSelectedRevisions } = useSelectRevision();

  const btnStyles = ButtonStyles(mode);

  const styles = {
    button: style({ ...btnStyles.Primary }),
  };

  const handleAddSelectedRevisions = () => {
    //update to set stage to committed in isEditable
    addSelectedRevisions();
  };

  return (
    <Button
      id='compare-button'
      variant='contained'
      className={`compare-button ${styles.button}`}
      aria-label='compare revisions'
      sx={{ textTransform: 'none !important' }}
      onClick={handleAddSelectedRevisions}
    >
      {strings.button}
    </Button>
  );
}
