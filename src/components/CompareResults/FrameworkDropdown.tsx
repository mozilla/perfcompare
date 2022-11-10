import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

import { frameworks } from '../../common/constants';
import { useAppSelector } from '../../hooks/app';
import useHandleChangeDropdown from '../../hooks/useHandleChangeDropdown';

function FrameworkDropdown() {
  const currentFramework = useAppSelector(
    (state) => state.compareResults.framework.name,
  );
  const selectedRevisions = useAppSelector(
    (state) => state.selectedRevisions.revisions,
  );
  const { handleFrameworkDropdownChange } = useHandleChangeDropdown();

  return (
    <FormControl>
      <InputLabel id="select-framework">framework</InputLabel>
      <Select
        value={currentFramework}
        labelId="select-repository"
        label="repository"
      >
        {frameworks.map((framework) => (
          <MenuItem
            id={framework.name}
            value={framework.name}
            key={framework.name}
            onClick={() =>
              void handleFrameworkDropdownChange(framework, selectedRevisions)
            }
          >
            {framework.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default FrameworkDropdown;
