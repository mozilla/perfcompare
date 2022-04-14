import React from 'react';

import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import SearchViewHelper from '../../utils/searchViewHelper';
import SearchResultsList from './SearchResultsList';

const { handleChangeDropdown, handleChangeSearch } = SearchViewHelper;

function SearchInput(props) {
  const { repository, searchResults } = props;
  const repoList = ['try', 'autoland', 'mozilla-central'];

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
        label="Search By Revision ID or Author Email"
        variant="outlined"
        sx={{ width: '75%' }}
        onChange={handleChangeSearch}
      />
      {searchResults.length > 0 && <SearchResultsList />}
    </Container>
  );
}

SearchInput.propTypes = {
  repository: PropTypes.string.isRequired,
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
    searchResults: state.search.searchResults,
  };
}

export default connect(mapStateToProps)(SearchInput);
