import Button from '@mui/material/Button';

import { Strings } from '../../resources/Strings';

interface EditButtonProps {
  onEditAction: () => void;
}

const baseComp = Strings.components.searchDefault.base;
const editImgUrl = baseComp.editIcon;
const editText = baseComp.editText;

const buttonIcon = (
  <img
    id='edit-button-icon'
    className='icon icon-edit'
    src={editImgUrl}
    alt='edit-icon'
  />
);

export default function EditButton({ onEditAction }: EditButtonProps) {
  return (
    <Button
      className='global-edit-button edit-revision-button'
      name='edit-button'
      aria-label='edit revision'
      startIcon={buttonIcon}
      onClick={onEditAction}
    >
      {editText}
    </Button>
  );
}
