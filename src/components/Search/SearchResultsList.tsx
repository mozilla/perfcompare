import Box from '@mui/material/Box';
import List from '@mui/material/List';

import type { Revision } from '../../types/state';
import SearchResultsListItem from './SearchResultsListItem';

function SearchResultsList(props: SearchResultsListProps) {
  const { searchResults } = props;

  return (
    <Box
      id="search-results-list"
      sx={{
        maxWidth: '100%',
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'grey.500',
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
      <List>
        {searchResults.map((item, index) => (
          <SearchResultsListItem key={item.id} index={index} item={item} />
        ))}
      </List>
    </Box>
  );
}

interface SearchResultsListProps {
  searchResults: Revision[];
}

export default SearchResultsList;
