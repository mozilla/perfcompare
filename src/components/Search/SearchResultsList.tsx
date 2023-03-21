import { useEffect } from 'react';

import Box from '@mui/material/Box';
import List from '@mui/material/List';

import type { Revision } from '../../types/state';
import SearchResultsListItem from './SearchResultsListItem';

function SearchResultsList(props: SearchResultsListProps) {
  const { searchResults, view } = props;

  useEffect(() => {
    const resultsList = document.getElementById('search-results-list');
    if (resultsList) {
      const topOfList = resultsList.offsetTop;
      const bottomOfVisibleWindow = window.innerHeight;
      const listHeight = bottomOfVisibleWindow - topOfList - 12;
      resultsList.style.maxHeight = `${Math.max(listHeight, 240)}px`;
    }
  }, []);

  return (
    <Box
      id="search-results-list"
      sx={{
        maxWidth: '100%',
        maxHeight: '100vh',
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'grey.500',
        borderRadius: '4px',

        overflow: 'auto',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'grey.400',
          borderRadius: '20px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          backgroundColor: 'grey.500',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'grey.200',
          borderRadius: '20px',
        },

        '&:focus': {
          borderColor: 'primary.main',
        },
        '&:hover': {
          borderColor: 'text.primary',
        },
      }}
      alignItems="flex-end"
    >
      <List dense={view == 'compare-results'}>
        {searchResults.map((item, index) => (
          <SearchResultsListItem
            key={item.id}
            index={index}
            item={item}
            view={view}
          />
        ))}
      </List>
    </Box>
  );
}

interface SearchResultsListProps {
  searchResults: Revision[];
  view: 'compare-results' | 'search';
}

export default SearchResultsList;
