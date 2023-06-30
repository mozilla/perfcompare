import React, { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import List from '@mui/material/List';

import { repoMap } from '../../common/constants';
import { RootState } from '../../common/store';
import { useAppSelector } from '../../hooks/app';
import { SelectRevsStyles } from '../../styles';
import { InputType, RevisionsList } from '../../types/state';
import SelectedRevisionItem from './SelectedRevisionItem';

function SelectedRevisions({
  mode,
  searchType,
  isWarning,
  selectedRevisions,
}: SelectedRevisionsProps) {
  const styles = SelectRevsStyles(mode);
  const checkedRevisionsList = useAppSelector(
    (state: RootState) => state.search[searchType].checkedRevisions,
  );

  const repository = checkedRevisionsList.map((item) => {
    const selectedRep = repoMap[item.repository_id];
    return selectedRep;
  });

  const selectedRevRepo = selectedRevisions?.map((item) => {
    const selectedRep = repoMap[item.repository_id];
    return selectedRep;
  });

  return (
    <Box className={styles.box} data-testid='selected-revs'>
      <List>
        {checkedRevisionsList.map((item, index) => (
          <SelectedRevisionItem
            key={item.id}
            index={index}
            item={item}
            mode={mode}
            repository={repository[index]}
            searchType={searchType}
            isWarning={isWarning}
          />
        ))}

        {selectedRevisions &&
          selectedRevisions.map((item, index) => (
            <SelectedRevisionItem
              key={item.id}
              index={index}
              item={item}
              mode={mode}
              repository={selectedRevRepo && selectedRevRepo[index]}
              searchType={searchType}
              isWarning={isWarning}
            />
          ))}
      </List>
    </Box>
  );
}

interface SelectedRevisionsProps {
  mode: 'light' | 'dark';
  searchType: InputType;
  isWarning: boolean;
  selectedRevisions?: RevisionsList[];
}

export default SelectedRevisions;
