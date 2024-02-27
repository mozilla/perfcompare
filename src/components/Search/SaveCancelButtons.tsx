import Button from '@mui/material/Button';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import { Strings } from '../../resources/Strings';
import { ButtonStyles } from '../../styles';
import type { InputType } from '../../types/state';

interface SaveCancelButtonsProps {
  searchType: InputType;
  onSave: () => void;
  onCancel: () => void;
}

const base = Strings.components.searchDefault.base;
const save = base.save;
const cancel = base.cancel;

export default function SaveCancelButtons({
  searchType,
  onCancel,
  onSave,
}: SaveCancelButtonsProps) {
  const mode = useAppSelector((state) => state.theme.mode);
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
  return (
    <div className='cancel-save-btns' id='cancel-save_btns'>
      <Button
        className={`cancel-save cancel-button ${cancelBtn.main} cancel-button-${searchType}`}
        role='button'
        name='cancel-button'
        aria-label='cancel edit'
        variant='contained'
        onClick={onCancel}
      >
        {cancel}
      </Button>
      <Button
        className={`cancel-save save-button save-button-${searchType} 
        }`}
        role='button'
        name='save-button'
        aria-label='save edit'
        variant='contained'
        onClick={onSave}
      >
        {save}
      </Button>
    </div>
  );
}
