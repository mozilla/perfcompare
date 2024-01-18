import { Dispatch, SetStateAction } from 'react';

import Box from '@mui/material/Box';
import List from '@mui/material/List';

import { SelectListStyles } from '../../styles';
import { RevisionsList, ThemeMode, Repository } from '../../types/state';
import SearchResultsListItem from './SearchResultsListItem';

interface InProgressState {
  revs: RevisionsList[];
  repos: Repository['name'][];
  isInProgress: boolean;
}
interface SearchResultsListProps {
  isEditable: boolean;
  isBase: boolean;
  mode: ThemeMode;
  searchResults: RevisionsList[];
  inProgress: InProgressState;
  setInProgress: Dispatch<SetStateAction<InProgressState>>;
}
function SearchResultsList({
  isEditable,
  isBase,
  mode,
  searchResults,
  inProgress,
  setInProgress,
}: SearchResultsListProps) {
  const styles = SelectListStyles(mode);

  return (
    <Box
      className={`${styles} results-list-${mode}`}
      id='search-results-list'
      alignItems='flex-end'
      data-testid='list-mode'
    >
      <List dense={isEditable == true} sx={{ paddingTop: '0' }}>
        {searchResults.map((item, index) => (
          <SearchResultsListItem
            key={item.id}
            index={index}
            item={item}
            isEditable={isEditable}
            isBase={isBase}
            setInProgress={setInProgress}
            inProgress={inProgress}
          />
        ))}
      </List>
    </Box>
  );
}

export default SearchResultsList;
