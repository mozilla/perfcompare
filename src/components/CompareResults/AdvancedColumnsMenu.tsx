import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';

import { useAppDispatch, useAppSelector } from '../../hooks/app';
import useAdvancedColumns from '../../hooks/useAdvancedColumns';
import useRawSearchParams from '../../hooks/useRawSearchParams';
import {
  updateShowCliffsDelta,
  updateShowCles,
} from '../../reducers/ColumnPrefsSlice';
import type { AdvancedColumns } from '../../types/types';
import {
  ADVANCED_COLUMNS_PARAM,
  serializeAdvancedColumns,
} from '../../utils/advancedColumnsUrl';

// The advanced statistics columns (Cliff's Delta, CLES) are toggled
// independently — either, both, or neither can be shown.
// Shared by the main and subtests controls.

// The option keys match the URL serializer (see utils/advancedColumnsUrl).
const COLUMN_OPTIONS = [
  { key: 'cliffs_delta', label: "Cliff's Delta" },
  { key: 'cles', label: 'CLES' },
] as const;

function AdvancedColumnsMenu() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.theme.mode);
  const { cliffsDelta, cles } = useAdvancedColumns();
  const [rawSearchParams, updateRawSearchParams] = useRawSearchParams();

  const selectedKeys = [
    cliffsDelta ? 'cliffs_delta' : null,
    cles ? 'cles' : null,
  ].filter(Boolean) as string[];

  const applyAdvancedColumns = (next: AdvancedColumns) => {
    dispatch(updateShowCliffsDelta(next.cliffsDelta));
    dispatch(updateShowCles(next.cles));

    const params = new URLSearchParams(rawSearchParams);
    const value = serializeAdvancedColumns(next);
    if (value) {
      params.set(ADVANCED_COLUMNS_PARAM, value);
    } else {
      params.delete(ADVANCED_COLUMNS_PARAM);
    }
    updateRawSearchParams(params);
  };

  const onChange = (event: SelectChangeEvent<string[]>) => {
    const { value } = event.target;
    const keys = typeof value === 'string' ? value.split(',') : value;
    applyAdvancedColumns({
      cliffsDelta: keys.includes('cliffs_delta'),
      cles: keys.includes('cles'),
    });
  };

  return (
    <Tooltip
      placement='top'
      title="Show the advanced statistics columns (Cliff's Delta, CLES)"
    >
      <FormControl size='small' sx={{ width: '100%' }}>
        <Select
          multiple
          displayEmpty
          data-testid='advanced-columns-select'
          className='advanced-columns-select'
          value={selectedKeys}
          onChange={onChange}
          // Always show a fixed label rather than the selected column keys.
          renderValue={() => 'Advanced columns'}
          variant='outlined'
          size='small'
          // Keep the visible label as the accessible name; without this MUI's
          // Tooltip would set the (Cliff's-Delta-mentioning) title as aria-label.
          inputProps={{ 'aria-label': 'Advanced columns' }}
          MenuProps={{
            classes: {
              paper: `paper-repo paper-${mode === 'light' ? 'light' : 'dark'}`,
            },
          }}
        >
          {COLUMN_OPTIONS.map(({ key, label }) => (
            <MenuItem key={key} value={key}>
              <Checkbox checked={selectedKeys.includes(key)} size='small' />
              <ListItemText primary={label} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Tooltip>
  );
}

export default AdvancedColumnsMenu;
