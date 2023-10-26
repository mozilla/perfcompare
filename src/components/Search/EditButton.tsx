import React, { Dispatch } from 'react';

import Button from '@mui/material/Button';

import useSelectedRevisions from '../../hooks/useSelectedRevisions';
import { Strings } from '../../resources/Strings';
import type { InputType } from '../../types/state';

interface EditButtonProps {
  searchType: InputType;
  setFormIsDisplayed: Dispatch<React.SetStateAction<boolean>>;
  formIsDisplayed: boolean;
}

const base = Strings.components.searchDefault.base;
const editImgUrl = base.editIcon;

export default function EditButton({
  searchType,
  setFormIsDisplayed,
  formIsDisplayed,
}: EditButtonProps) {
  const { editSelectedRevisions } = useSelectedRevisions();

  const handleEditAction = () => {
    setFormIsDisplayed(!formIsDisplayed);
    editSelectedRevisions(searchType);
  };

  return (
    <Button
      className={`edit-button edit-button-${searchType} show-edit-btn`}
      id={`${searchType}-edit-button`}
      role='button'
      name='edit-button'
      aria-label='edit button'
      onClick={handleEditAction}
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
