import React from 'react';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import { connect } from 'react-redux';

import type { Revision, State } from '../../types/state';
import SearchResultsListItem from './SearchResultsListItem';

function SearchResultsList(props: SearchResultsListProps) {
  const { searchResults, handleChildClick } = props;

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
        {searchResults.map((item) => (
          <SearchResultsListItem
            key={item.id}
            item={item}
            handleChildClick={handleChildClick}
          />
        ))}
      </List>
    </Box>
  );
}

interface SearchResultsListProps {
  searchResults: Revision[];
  handleChildClick: (e: React.MouseEvent) => void;
}

function mapStateToProps(state: State) {
  return { searchResults: state.search.searchResults };
}

export default connect(mapStateToProps)(SearchResultsList);
