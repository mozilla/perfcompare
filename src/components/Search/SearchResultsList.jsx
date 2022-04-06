import React from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

function SearchResultsList(props) {
  const { searchResults } = props;
  return searchResults.length > 0 ? (
    <Grid container>
      <Grid item xs={3} />
      <Grid item xs={9}>
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
          <List>
            {searchResults &&
              searchResults.map((item) => (
                <ListItemButton key={item.id}>
                  <ListItem disablePadding>
                    <ListItemText primary={item.revision} />
                  </ListItem>
                </ListItemButton>
              ))}
          </List>
        </Box>
      </Grid>
    </Grid>
  ) : (
    <div />
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
        }),
      ),
      revision_count: PropTypes.number,
      push_timestamp: PropTypes.number.isRequired,
      repository_id: PropTypes.number.isRequired,
    }),
  ).isRequired,
};

function mapStateToProps(state) {
  return { searchResults: state.search.searchResults };
}

export default connect(mapStateToProps)(SearchResultsList);
