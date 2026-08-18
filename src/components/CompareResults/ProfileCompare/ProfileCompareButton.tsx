import { useState } from 'react';

import AssessmentIcon from '@mui/icons-material/Assessment';
import { IconButton } from '@mui/material';

import { ProfileCompareDialog } from './ProfileCompareDialog';
import { CompareResultsItem } from '../../../types/state';

// Rows for which we support profile comparison. Currently only speedometer3.
export function supportsProfileCompare(suite: string): boolean {
  return suite === 'speedometer3';
}

export function ProfileCompareButton({
  result,
}: {
  result: CompareResultsItem;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <IconButton
        title='open profile comparison for this result'
        color='primary'
        size='small'
        onClick={() => setDialogOpen(true)}
      >
        <AssessmentIcon />
      </IconButton>
      <ProfileCompareDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        result={result}
      />
    </>
  );
}
