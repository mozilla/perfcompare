import React, { Component } from 'react';

import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import SearchViewHelper from '../../utils/searchViewHelper';
import SearchResultsList from './SearchResultsList';

const { handleChangeSearch, handleClickOutsideInput } = SearchViewHelper;

class SearchInput extends Component {
  componentDidMount() {
    document.addEventListener('mousedown', handleClickOutsideInput);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', handleClickOutsideInput);
  }

  render() {
    const { inputError, inputHelperText, searchIsFocused, searchResults } =
      this.props;
    return (
      <Grid item xs={6}>
        {!inputError && !inputHelperText ? (
          /* text field without errors */
          <TextField
            label="Search By Revision ID or Author Email"
            variant="outlined"
            sx={{ width: '100%' }}
            onChange={handleChangeSearch}
            focused={searchIsFocused}
          />
        ) : (
          /* text field with errors */
          <TextField
            error
            helperText={inputHelperText}
            label="Search By Revision ID or Author Email"
            variant="outlined"
            sx={{ width: '100%' }}
            onChange={handleChangeSearch}
            focused={searchIsFocused}
          />
        )}
        {searchResults.length > 0 && searchIsFocused && <SearchResultsList />}
      </Grid>
    );
  }
}

SearchInput.propTypes = {
  inputError: PropTypes.bool.isRequired,
  inputHelperText: PropTypes.string.isRequired,
  searchIsFocused: PropTypes.bool.isRequired,
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
  return {
    searchIsFocused: state.search.searchIsFocused,
    inputError: state.search.inputError,
    inputHelperText: state.search.inputHelperText,
    searchResults: state.search.searchResults,
  };
}

export default connect(mapStateToProps)(SearchInput);
