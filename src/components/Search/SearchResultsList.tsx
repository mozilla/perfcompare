import Box from '@mui/material/Box';
import List from '@mui/material/List';
import { useMediaQuery,Theme } from "@mui/material";

import type { Revision } from '../../types/state';
import SearchResultsListItem from './SearchResultsListItem';

function SearchResultsList(props: SearchResultsListProps) {
  const { searchResults, view } = props;
  const isSmallScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down("sm"));

  const maxHeight = isSmallScreen ? "300px" : "500px";

  return (
    <Box
      id="search-results-list"
      sx={{
        maxWidth: '100%',
        maxHeight: maxHeight,
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
        overflowY: "auto",
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
