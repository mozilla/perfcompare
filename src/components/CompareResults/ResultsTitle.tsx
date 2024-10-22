import { useState } from 'react';

import EditIcon from '@mui/icons-material/EditOutlined';
import { Input } from '@mui/material';
import { style } from 'typestyle';

import useRawSearchParams from '../../hooks/useRawSearchParams';
import { FontsRaw, Colors } from '../../styles';

export const ResultsTitle = () => {
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
    editIcon: style({
      marginLeft: '10px',
      cursor: 'pointer',
      color: Colors.LinkText,
    }),
    hide: style({
      display: 'none',
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

  return (
    <div data-testid='results-title-component'>
      {isEditing ? (
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
      ) : (
        <>
          <span>{resultsTitle}</span>
          <EditIcon
            className={styles.editIcon}
            data-testid='edit-icon'
            onClick={handleEdit}
          />
        </>
      )}
    </div>
  );
};
