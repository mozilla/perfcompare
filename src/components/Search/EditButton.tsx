import React from 'react';

import Button from '@mui/material/Button';

import useSelectedRevisions from '../../hooks/useSelectedRevisions';
import { Strings } from '../../resources/Strings';
import type { InputType } from '../../types/state';

interface EditButtonProps {
  searchType: InputType;
  editButtonRef: React.RefObject<HTMLButtonElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  selectedRevisionsRef: React.RefObject<HTMLDivElement>;
}

const base = Strings.components.searchDefault.base;
const editImgUrl = base.editIcon;

export default function EditButton({
  searchType,
  editButtonRef,
  containerRef,
  selectedRevisionsRef,
}: EditButtonProps) {
  const { editSelectedRevisions } = useSelectedRevisions();

  const handleVisibility = () => {
    editButtonRef.current?.classList.add('hide-edit-btn');
    containerRef.current?.classList.remove('hide-container');
    selectedRevisionsRef.current?.classList.add('show-base-close-icon');
  };

  const handleEditAction = () => {
    editSelectedRevisions(searchType);
    handleVisibility();
  };

  return (
    <Button
      className={`edit-button edit-button-${searchType} show-edit-btn`}
      id={`${searchType}-edit-button`}
      role='button'
      name='edit-button'
      aria-label='edit button'
      onClick={handleEditAction}
      ref={editButtonRef}
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
