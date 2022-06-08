import Box from '@mui/material/Box';
import List from '@mui/material/List';
import { connect } from 'react-redux';

import useCheckRevision from '../../hooks/useCheckRevision';
import type { Revision, State } from '../../types/state';
import SearchResultsListItem from './SearchResultsListItem';

function SearchResultsList(props: SearchResultsListProps) {
  const { searchResults } = props;
  const { handleToggle } = useCheckRevision();
  return (
    <Box
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
      <List className="search-revision-list">
        {searchResults.map((item, index) => (
          <SearchResultsListItem
            key={item.id}
            index={index}
            item={item}
            handleToggle={handleToggle}
          />
        ))}
      </List>
    </Box>
  );
}

interface SearchResultsListProps {
  searchResults: Revision[];
}

function mapStateToProps(state: State) {
  return { searchResults: state.search.searchResults };
}

export default connect(mapStateToProps)(SearchResultsList);
