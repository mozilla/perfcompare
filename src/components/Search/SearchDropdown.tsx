import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { connect } from 'react-redux';

import { repoMapping } from '../../common/constants';
import useHandleChangeDropdown from '../../hooks/useHandleChangeDropdown';
import type { State } from '../../types/state';

function SearchDropdown(props: SearchDropdownProps) {
  const { repository } = props;
  const { handleChangeDropdown } = useHandleChangeDropdown();

  return (
    <Grid item xs={2}>
      <FormControl sx={{ width: '100%' }}>
        <InputLabel id="select-repository">repository</InputLabel>
        <Select
          value={repository}
          labelId="select-repository"
          label="repository"
        >
          {Object.keys(repoMapping).map((key) => (
            <MenuItem
              id={repoMapping[key]}
              value={repoMapping[key]}
              key={repoMapping[key]}
              onClick={(e) => handleChangeDropdown(e)}
            >
              {repoMapping[key]}
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
