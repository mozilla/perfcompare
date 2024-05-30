import Button from '@mui/material/Button';

import { Strings } from '../../resources/Strings';
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
  return (
    <div className='cancel-save-btns' id='cancel-save_btns'>
      <Button
        className={`cancel-save cancel-button cancel-button-${searchType}`}
        name='cancel-button'
        color='secondary'
        onClick={onCancel}
      >
        {cancel}
      </Button>
      <Button
        className={`cancel-save save-button save-button-${searchType}`}
        name='save-button'
        onClick={onSave}
      >
        {save}
      </Button>
    </div>
  );
}
