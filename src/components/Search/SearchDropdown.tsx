import React from 'react';

import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { connect } from 'react-redux';

import type { State } from '../../types/state';
import { handleChangeDropdown } from '../../utils/searchViewHelper';

function SearchDropdown(props: SearchDropdownProps) {
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

interface SearchDropdownProps {
  repository: string;
}

function mapStateToProps(state: State) {
  return {
    repository: state.search.repository,
  };
}

export default connect(mapStateToProps)(SearchDropdown);
