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
    const newTitle = event.target.value;
    setResultsTitle(newTitle);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('title', newTitle);
    updateSearchParams(newSearchParams, {
      method: 'push',
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleEditComplete = (
    event: React.FocusEvent | React.KeyboardEvent,
  ) => {
    if ((event as React.KeyboardEvent).key === 'Enter') {
      setIsEditing(false);
    }
  };

  return (
    <>
      <div className={isEditing ? styles.hide : styles.title}>
        <label htmlFor='results'>{resultsTitle}</label>
        <EditIcon className={styles.editIcon} onClick={handleEdit} />
      </div>
      {isEditing && (
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
      )}
    </>
  );
};
