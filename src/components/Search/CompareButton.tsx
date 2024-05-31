import Button from '@mui/material/Button';

import { useAppSelector } from '../../hooks/app';
import { SearchStyles } from '../../styles';
import CancelButton from './CancelButton';

interface CompareButtonProps {
  label: string;
  hasNonEditableState: boolean;
  onCancel: () => void;
  onSetDisplayForm: (display: boolean) => void;
  formIsDisplayed: boolean;
}

export default function CompareButton({
  label,
  hasNonEditableState,
  onSetDisplayForm,
  onCancel,
  formIsDisplayed,
}: CompareButtonProps) {
  const mode = useAppSelector((state) => state.theme.mode);
  const cancelCompareStyle = SearchStyles(mode);

  return (
    <div className={`${cancelCompareStyle.cancelCompareBtn} cancel-compare`}>
      {hasNonEditableState && formIsDisplayed && (
        <CancelButton
          onCancel={() => {
            onCancel();
            onSetDisplayForm(false);
          }}
        />
      )}
      <Button id='compare-button' color='primary' type='submit'>
        {label}
      </Button>
    </div>
  );
}
