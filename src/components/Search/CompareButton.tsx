import Button from '@mui/material/Button';
import { style } from 'typestyle';

import useSelectRevision from '../../hooks/useSelectedRevisions';
import { Strings } from '../../resources/Strings';
import { ButtonStyles } from '../../styles';

interface CompareButtonProps {
  mode: 'light' | 'dark';
  view: 'search' | 'compare-results';
}

const strings = Strings.components.searchDefault.sharedCollasped;

export default function CompareButton({ mode }: CompareButtonProps) {
  const { addSelectedRevisions } = useSelectRevision();

  const btnStyles = ButtonStyles(mode);

  const styles = {
    button: style({ ...btnStyles.Primary }),
  };

  const handleAddSelectedRevisions = () => {
    addSelectedRevisions();
  };

  return (
    <Button
      id='compare-button'
      variant='contained'
      className={`compare-button${styles.button}`}
      aria-label='compare revisions'
      sx={{ textTransform: 'none !important' }}
      onClick={handleAddSelectedRevisions}
    >
      {strings.button}
    </Button>
  );
}
