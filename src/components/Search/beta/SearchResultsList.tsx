import Box from '@mui/material/Box';
import List from '@mui/material/List';

import { SelectListLight, SelectListDark } from '../../../styles';
import type { Revision } from '../../../types/state';
import SearchResultsListItem from './SearchResultsListItem';

function SearchResultsList(props: SearchResultsListProps) {
  const { searchResults, view, mode } = props;

  return (
    <Box
      className={mode == 'light' ? SelectListLight : SelectListDark}
      id='search-results-list'
      alignItems='flex-end'
    >
      <List dense={view == 'compare-results'} sx={{ paddingTop: '0' }}>
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
  mode: 'light' | 'dark';
}

export default SearchResultsList;
