import Box from '@mui/material/Box';
import List from '@mui/material/List';

import type { Revision } from '../../types/state';
import SearchResultsListItem from './SearchResultsListItem';

function SearchResultsList(props: SearchResultsListProps) {
  const { searchResults, view } = props;

  return (
    <Box
      id="search-results-list"
      sx={{
        maxWidth: '67.9%',
        maxHeight: '60vh',
        overflowY: 'scroll',
        margin: '5px 0 0 20.2%',
        bgcolor: 'background.paper',
        border: '1px solid grey',
        borderRadius: '4px',
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
