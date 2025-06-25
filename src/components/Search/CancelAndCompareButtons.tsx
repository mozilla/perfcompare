import { Suspense } from 'react';

import Button from '@mui/material/Button';
import { Await, useLoaderData } from 'react-router';
import { style } from 'typestyle';

import { Strings } from '../../resources/Strings';
import { Spacing } from '../../styles/Spacing';
import type { LoaderReturnValue } from '../CompareResults/loader';
import type { LoaderReturnValue as OverTimeLoaderReturnValue } from '../CompareResults/overTimeLoader';

interface CompareButtonProps {
  label: string;
  hasCancelButton: boolean;
  hasEditButton: boolean;
  onCancel: () => void;
}

type CombinedLoaderReturnValue = LoaderReturnValue | OverTimeLoaderReturnValue;
export default function CompareButton({
  label,
  hasCancelButton,
  hasEditButton,
  onCancel,
}: CompareButtonProps) {
  const { results } = useLoaderData<CombinedLoaderReturnValue>();

  const cancelText = Strings.components.searchDefault.sharedCollasped.cancel;

  const cancelCompareStyles = style({
    display: 'flex',
    alignItems: 'center',
    gap: `${Spacing.Small}px`,
  });

  const renderCompareButton = () => {
    if (hasEditButton) {
      return (
        <Suspense
          fallback={
            <Button id='compare-button' color='primary' type='submit' disabled>
              Loading...
            </Button>
          }
        >
          <Await resolve={results}>
            <Button id='compare-button' color='primary' type='submit'>
              {label}
            </Button>
          </Await>
        </Suspense>
      );
    } else
      return (
        <Button id='compare-button' color='primary' type='submit'>
          {label}
        </Button>
      );
  };

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

      {renderCompareButton()}
    </div>
  );
}
