import React, { Component } from 'react';

import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { repoList } from '../../common/constants';
import SearchViewHelper from '../../utils/searchViewHelper';
import SearchResultsList from './SearchResultsList';

const { handleChangeDropdown, handleChangeSearch, handleClickOutsideInput } =
  SearchViewHelper;

class SearchInput extends Component {
  componentDidMount() {
    document.addEventListener('mousedown', handleClickOutsideInput);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', handleClickOutsideInput);
  }

  render() {
    const { repository, searchIsFocused, searchResults } = this.props;
    return (
      <Container maxWidth="md">
        <FormControl sx={{ width: '25%' }}>
          <InputLabel id="select-repository">repository</InputLabel>
          <Select
            value={repository}
            labelId="select-repository"
            label="repository"
          >
            {repoList.length > 0 &&
              repoList.map((item) => (
                <MenuItem
                  id={item}
                  value={item}
                  key={item}
                  onClick={handleChangeDropdown}
                >
                  {item}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
        <TextField
          id="search-revision-input"
          label="Search By Revision ID or Author Email"
          variant="outlined"
          sx={{ width: '75%' }}
          onChange={handleChangeSearch}
          focused={searchIsFocused}
        />
        {searchResults.length > 0 && searchIsFocused && <SearchResultsList />}
      </Container>
    );
  }
}

SearchInput.propTypes = {
  repository: PropTypes.string.isRequired,
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
    repository: state.search.repository,
    searchIsFocused: state.search.searchIsFocused,
    searchResults: state.search.searchResults,
  };
}

export default connect(mapStateToProps)(SearchInput);
