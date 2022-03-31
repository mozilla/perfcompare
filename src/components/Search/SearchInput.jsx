import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Container from '@mui/material/Container';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';

import SearchResultsList from './SearchResultsList';

import SearchViewHelper from '../../utils/SearchViewHelper';

const { handleChangeDropdown, handleChangeSearch } = SearchViewHelper;

function SearchInput(props) {
  const { repository } = props;
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
      <SearchResultsList />
    </Container>
  );
}

SearchInput.propTypes = {
  repository: PropTypes.string.isRequired,
};

function mapStateToProps(state) {
  return {
    repository: state.search.repository,
  };
}

export default connect(mapStateToProps)(SearchInput);
