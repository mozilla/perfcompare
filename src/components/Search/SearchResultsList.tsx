import React from 'react';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import SearchResultsListItem from './SearchResultsListItem';

function SearchResultsList(props) {
  const { searchResults } = props;
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
          <SearchResultsListItem key={item.id} item={item} />
        ))}
      </List>
    </Box>
  );
}

SearchResultsList.propTypes = {
  searchResults: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      revision: PropTypes.string.isRequired,
      author: PropTypes.string.isRequired,
      revisions: PropTypes.arrayOf(
        PropTypes.shape({
          result_set_id: PropTypes.number,
          repository_id: PropTypes.number,
          revision: PropTypes.string,
          author: PropTypes.string,
          comments: PropTypes.string,
        }).isRequired,
      ),
      revision_count: PropTypes.number,
      push_timestamp: PropTypes.number.isRequired,
      repository_id: PropTypes.number.isRequired,
    }),
  ).isRequired,
};

function mapStateToProps(state) {
  return {
    searchResults: state.search.searchResults,
  };
}

export default connect(mapStateToProps)(SearchResultsList);
