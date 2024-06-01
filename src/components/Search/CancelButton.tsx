import Button from '@mui/material/Button';

import { Strings } from '../../resources/Strings';

interface CancelButtonsProps {
  onCancel: () => void;
}

const base = Strings.components.searchDefault.base;
const cancel = base.cancel;

export default function CancelButtons({ onCancel }: CancelButtonsProps) {
  return (
    <Button
      className={`cancel-button btn-all`}
      name='cancel-button'
      color='secondary'
      onClick={onCancel}
    >
      {cancel}
    </Button>
  );
}
