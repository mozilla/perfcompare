import { useState } from 'react';

import { Input } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { style } from 'typestyle';

import { FontsRaw } from '../../styles';

export const ResultsTitle = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [resultsTitle, setResultsTitle] = useState(
    searchParams.get('title') || 'Results',
  );

  const styles = {
    titleInput: style({
      ...FontsRaw.HeadingXS,
      fontWeight: 700,
      letterSpacing: '-0.01em',
      margin: 0,
    }),
    screenReaderOnly: style({
      position: 'absolute',
      width: '1px',
      height: '1px',
      margin: '-1px',
      padding: '0',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      border: '0',
    }),
  };

  const handleResultsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = event.target.value;
    setResultsTitle(newTitle);
    setSearchParams((prev) => {
      prev.set('title', newTitle);
      return prev;
    });
  };
  return (
    <>
      <label htmlFor='results-title' className={styles.screenReaderOnly}>
        Results Title
      </label>
      <Input
        id='results-title'
        type='text'
        name='results-title'
        value={resultsTitle}
        onChange={handleResultsChange}
        className={styles.titleInput}
      />
    </>
  );
};
