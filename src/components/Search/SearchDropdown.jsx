import React from 'react';

import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import SearchViewHelper from '../../utils/searchViewHelper';

const { handleChangeDropdown } = SearchViewHelper;

function SearchDropdown(props) {
  const { repository } = props;
  const repoList = ['try', 'autoland', 'mozilla-central'];

  return (
    <Grid item xs={2}>
      <FormControl sx={{ width: '100%' }}>
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
    </Grid>
  );
}

SearchDropdown.propTypes = {
  repository: PropTypes.string.isRequired,
};

function mapStateToProps(state) {
  return {
    repository: state.search.repository,
  };
}

export default connect(mapStateToProps)(SearchDropdown);
