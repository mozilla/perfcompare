import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { connect } from 'react-redux';

import { repoMap } from '../../common/constants';
import useHandleChangeDropdown from '../../hooks/useHandleChangeDropdown';
import type { State } from '../../types/state';

function SearchDropdown(props: SearchDropdownProps) {
  const { repository, view } = props;
  const { handleChangeDropdown } = useHandleChangeDropdown();
  const size = view == 'compare-results' ? 'small' : undefined;

  return (
    <FormControl sx={{ width: '100%' }} size={size}>
      <InputLabel id="select-repository">repository</InputLabel>
      <Select value={repository} labelId="select-repository" label="repository">
        {Object.keys(repoMap).map((key) => (
          <MenuItem
            id={repoMap[key]}
            value={repoMap[key]}
            key={repoMap[key]}
            onClick={(e) => handleChangeDropdown(e)}
          >
            {repoMap[key]}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

interface SearchDropdownProps {
  repository: string;
  view: 'compare-results' | 'search';
}

function mapStateToProps(state: State) {
  return {
    repository: state.search.repository,
  };
}

export default connect(mapStateToProps)(SearchDropdown);
