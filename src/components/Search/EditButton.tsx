import Button from '@mui/material/Button';

import { Strings } from '../../resources/Strings';

interface EditButtonProps {
  formIsDisplayed: boolean;
  isBase: boolean;
  setFormIsDisplayed: React.Dispatch<React.SetStateAction<boolean>>;
  onEdit: () => void;
}

const baseComp = Strings.components.searchDefault.base;
const editImgUrl = baseComp.editIcon;

export default function EditButton({
  isBase,
  setFormIsDisplayed,
  onEdit,
}: EditButtonProps) {
  const searchType = isBase ? 'base' : 'new';

  return (
    <Button
      className={`edit-button edit-button-${searchType} show-edit-btn`}
      id={`${searchType}-edit-button`}
      role='button'
      name='edit-button'
      aria-label='edit button'
      onClick={() => {
        onEdit();
        setFormIsDisplayed(true);
      }}
    >
      <img
        id={`${searchType}-edit-button-icon`}
        className='icon icon-edit'
        src={editImgUrl}
        alt='edit-icon'
      />
    </Button>
  );
}
