import React from 'react';

import Button from '@mui/material/Button';
import { style } from 'typestyle';

import { useAppDispatch } from '../../hooks/app';
import useSelectedRevisions from '../../hooks/useSelectedRevisions';
import { clearCheckedRevisionforType } from '../../reducers/SearchSlice';
import { Strings } from '../../resources/Strings';
import { ButtonStyles } from '../../styles';
import type { ThemeMode, InputType } from '../../types/state';

interface CompareButtonProps {
  mode: ThemeMode;
  searchType: InputType;
  containerRef: React.RefObject<HTMLDivElement>;
  editButtonRef: React.RefObject<HTMLButtonElement>;
  selectedRevisionsRef: React.RefObject<HTMLDivElement>;
}

const base = Strings.components.searchDefault.base;
const save = base.save;
const cancel = base.cancel;

export default function CompareButton({
  searchType,
  mode,
  containerRef,
  editButtonRef,
  selectedRevisionsRef,
}: CompareButtonProps) {
  const btnStyles = ButtonStyles(mode);
  const cancelBtn = {
    main: style({
      $nest: {
        '&.MuiButtonBase-root': {
          ...btnStyles.Secondary,
        },
      },
    }),
  };
  const dispatch = useAppDispatch();
  const { updateSelectedRevisions } = useSelectedRevisions();

  const handleCancelAction = () => {
    dispatch(clearCheckedRevisionforType({ searchType }));
    editButtonRef.current?.classList.remove('hide-edit-btn');
    containerRef.current?.classList.add('hide-container');
    selectedRevisionsRef.current?.classList.remove('show-base-close-icon');
  };

  const handleSaveAction = () => {
    updateSelectedRevisions(searchType);
    dispatch(clearCheckedRevisionforType({ searchType }));
    editButtonRef.current?.classList.remove('hide-edit-btn');
    containerRef.current?.classList.remove('hide-container');
  };

  return (
    <div className='cancel-save-btns' id='cancel-save_btns'>
      <Button
        className={`cancel-save cancel-button ${cancelBtn.main} cancel-button-${searchType}`}
        role='button'
        name='cancel-button'
        aria-label='cancel button'
        variant='contained'
        onClick={handleCancelAction}
      >
        {cancel}
      </Button>
      <Button
        className={`cancel-save save-button } save-button-${searchType} 
        }`}
        role='button'
        name='save-button'
        aria-label='save button'
        variant='contained'
        onClick={handleSaveAction}
      >
        {save}
      </Button>
    </div>
  );
}
