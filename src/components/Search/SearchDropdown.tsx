/* eslint-disable @typescript-eslint/restrict-template-expressions */
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { connect } from 'react-redux';

import { repoMap } from '../../common/constants';
import type { RootState } from '../../common/store';
import useHandleChangeDropdown from '../../hooks/useHandleChangeDropdown';
import { ButtonsLight } from '../../styles/Buttons';
import { Fonts  } from '../../styles/Fonts';
import { InputStyles } from '../../styles/Input';

function SearchDropdown(props: SearchDropdownProps) {
  const { repository, view } = props;
  const { handleChangeDropdown } = useHandleChangeDropdown();
  const size = view == 'compare-results' ? 'small' : undefined;
  const repoSelect = {
    baseRepository: '',
    newRepository: '',
    searchType: 'base' as 'base' | 'new',
  };

  return (
    <FormControl
      sx={{ width: '100%', marginBottom: '8px' }}
      size={size}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      className={`${InputStyles.dropDown} ${Fonts.BodyDefault}`}
    >
      <InputLabel id='select-repository-label'>repository</InputLabel>
      <Select
        value={repository}
        labelId='select-repository-label'
        label='repository'
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        className={ButtonsLight.Dropdown}
      >
        {Object.keys(repoMap).map((key) => (
          <MenuItem
            id={repoMap[key]}
            value={repoMap[key]}
            key={repoMap[key]}
            onClick={() => void handleChangeDropdown(repoSelect)}
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

function mapStateToProps(state: RootState) {
  return {
    repository: state.search.baseRepository,
  };
}

export default connect(mapStateToProps)(SearchDropdown);