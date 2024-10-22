import { useState } from 'react';

import { Button, IconButton, Input } from '@mui/material';
import { style } from 'typestyle';

import useRawSearchParams from '../../hooks/useRawSearchParams';
import { FontsRaw } from '../../styles';
import pencilDark from '../../theme/img/pencil-dark.svg';
import pencil from '../../theme/img/pencil.svg';

interface EditButtonProps {
  mode: string;
}

export const ResultsTitle = ({ mode }: EditButtonProps) => {
  const [searchParams, updateSearchParams] = useRawSearchParams();
  const [resultsTitle, setResultsTitle] = useState(
    searchParams.get('title') || 'Results',
  );
  const [isEditing, setIsEditing] = useState(false);

  const styles = {
    title: style({
      ...FontsRaw.HeadingXS,
      fontWeight: 700,
      letterSpacing: '-0.01em',
      margin: 0,
    }),
    titleWrapper: style({
      alignItems: 'center',
      display: 'flex',
      gap: '10px',
    }),
    screenReaderOnly: style({
      position: 'absolute',
      left: '-9999px',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
    }),
  };

  const handleResultsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = event.target.value.trim();
    setResultsTitle(newTitle);
  };

  const handleEdit = () => setIsEditing(true);

  const handleEditComplete = (
    event: React.FocusEvent | React.KeyboardEvent,
  ) => {
    if (
      (event as React.KeyboardEvent).key === 'Enter' ||
      event.type === 'blur'
    ) {
      const safeTitle = resultsTitle || 'Results';
      setResultsTitle(safeTitle);

      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('title', safeTitle);
      updateSearchParams(newSearchParams, {
        method: 'push',
      });

      setIsEditing(false);
    }
  };

  const buttonIcon = (
    <img
      src={mode === 'light' ? pencil.toString() : pencilDark.toString()}
      alt='edit-icon'
    />
  );

  return (
    <div data-testid='results-title-component'>
      {isEditing ? (
        <>
          <label htmlFor='results' className={styles.screenReaderOnly}>
            Results Title
          </label>
          <Input
            id='results'
            type='text'
            name='results-title'
            value={resultsTitle}
            onChange={handleResultsChange}
            onBlur={handleEditComplete}
            onKeyDown={handleEditComplete}
            className={styles.title}
          />
        </>
      ) : (
        <div className={styles.titleWrapper}>
          <span className={styles.title}>{resultsTitle}</span>
          <IconButton
            onClick={handleEdit}
            aria-label='edit the title'
            style={{ backgroundColor: 'red', width: 'fit-content' }}
          >
            <Button
              className='global-edit-button edit-revision-button'
              name='edit-button'
              aria-label='edit revision'
              endIcon={buttonIcon}
              color='primary'
              variant='text'
            />
          </IconButton>
        </div>
      )}
    </div>
  );
};
