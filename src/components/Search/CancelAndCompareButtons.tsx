import Button from '@mui/material/Button';
import { style } from 'typestyle';

import { Strings } from '../../resources/Strings';
import { Spacing } from '../../styles/Spacing';

interface CompareButtonProps {
  label: string;
  hasCancelButton: boolean;
  hasEditButton: boolean;
  onCancel: () => void;
}

export default function CompareButton({
  label,
  hasCancelButton,
  hasEditButton,
  onCancel,
}: CompareButtonProps) {
  const cancelText = Strings.components.searchDefault.sharedCollasped.cancel;

  const cancelCompareStyles = style({
    display: 'flex',
    alignItems: 'center',
    gap: `${Spacing.Small}px`,
  });

  return (
    <div className={`${cancelCompareStyles} cancel-compare`}>
      {hasCancelButton && (
        <Button
          className='cancel-button'
          name='cancel-button'
          color='secondary'
          onClick={onCancel}
        >
          {cancelText}
        </Button>
      )}
      {hasEditButton ? (
        <Button
          id='compare-button'
          color='primary'
          type='submit'
          sx={{ visibility: hasCancelButton ? 'visible' : 'hidden' }}
        >
          {label}
        </Button>
      ) : (
        <Button id='compare-button' color='primary' type='submit'>
          {label}
        </Button>
      )}
    </div>
  );
}
