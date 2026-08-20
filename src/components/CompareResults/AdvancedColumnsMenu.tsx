import { useState } from 'react';

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
  updateShowSignificance,
} from '../../reducers/ColumnPrefsSlice';
import type { AdvancedColumns } from '../../types/types';
import {
  ADVANCED_COLUMNS_PARAM,
  CLIFFS_DELTA,
  CLES,
  SIGNIFICANCE,
  serializeAdvancedColumns,
} from '../../utils/advancedColumnsUrl';

// The advanced statistics columns are toggled independently — any combination
// can be shown. The option values reuse the URL keys so the dropdown, the URL
// and the serializer share one source of truth. Shared by the main and
// subtests controls.
const COLUMN_OPTIONS = [
  { key: CLIFFS_DELTA, label: "Cliff's Delta" },
  { key: CLES, label: 'CLES' },
  { key: SIGNIFICANCE, label: 'Significance' },
] as const;

function AdvancedColumnsMenu() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.theme.mode);
  const advancedColumns = useAdvancedColumns();
  const [rawSearchParams, updateRawSearchParams] = useRawSearchParams();
  // Track the Select's open state so the tooltip can be suppressed while the
  // dropdown is open — otherwise it renders over (and hides) the checkboxes.
  const [menuOpen, setMenuOpen] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  // Derive the selected option values from the same serializer used for the
  // URL, so the Select's value can't drift from the URL encoding.
  const selectedKeys =
    serializeAdvancedColumns(advancedColumns)?.split(',') ?? [];

  const applyAdvancedColumns = (next: AdvancedColumns) => {
    dispatch(updateShowCliffsDelta(next.cliffsDelta));
    dispatch(updateShowCles(next.cles));
    dispatch(updateShowSignificance(next.significance));

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
      cliffsDelta: keys.includes(CLIFFS_DELTA),
      cles: keys.includes(CLES),
      significance: keys.includes(SIGNIFICANCE),
    });
  };

  return (
    <Tooltip
      placement='top'
      title="Show the advanced statistics columns (Cliff's Delta, CLES, Significance)"
      // Suppress the tooltip while the dropdown is open so it can't render over
      // the checkboxes.
      open={tooltipOpen && !menuOpen}
      onOpen={() => setTooltipOpen(true)}
      onClose={() => setTooltipOpen(false)}
    >
      <FormControl size='small' sx={{ width: '100%' }}>
        <Select
          multiple
          displayEmpty
          open={menuOpen}
          onOpen={() => setMenuOpen(true)}
          onClose={() => setMenuOpen(false)}
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
