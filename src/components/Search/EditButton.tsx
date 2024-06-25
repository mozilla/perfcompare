import Button from '@mui/material/Button';

import { Strings } from '../../resources/Strings';
import pencilDark from '../../theme/img/pencil-dark.svg';
import pencil from '../../theme/img/pencil.svg';

interface EditButtonProps {
  onEditAction: () => void;
  mode: string;
}

const baseComp = Strings.components.searchDefault.base;
const editText = baseComp.editText;

export default function EditButton({ onEditAction, mode }: EditButtonProps) {
  const buttonIcon = (
    <img
      id='edit-button-icon'
      className='icon icon-edit'
      src={mode === 'light' ? pencil.toString() : pencilDark.toString()}
      alt='edit-icon'
    />
  );

  return (
    <Button
      className='global-edit-button edit-revision-button'
      name='edit-button'
      aria-label='edit revision'
      startIcon={buttonIcon}
      onClick={onEditAction}
      color='primary'
      variant='text'
    >
      {editText}
    </Button>
  );
}
