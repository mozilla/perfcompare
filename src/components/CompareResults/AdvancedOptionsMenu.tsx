import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useSnackbar } from 'notistack';

import { useAppDispatch, useAppSelector } from '../../hooks/app';
import useAdvancedColumns from '../../hooks/useAdvancedColumns';
import useExpandedRowOptions from '../../hooks/useExpandedRowOptions';
import useRawSearchParams from '../../hooks/useRawSearchParams';
import {
  updateShowCliffsDelta,
  updateShowCles,
  updateShowSignificance,
  updateExpandedRow,
} from '../../reducers/ColumnPrefsSlice';
import type { AdvancedColumns, ExpandedRowOptions } from '../../types/types';
import {
  ADVANCED_COLUMNS_PARAM,
  CLIFFS_DELTA,
  CLES,
  SIGNIFICANCE,
  serializeAdvancedColumns,
} from '../../utils/advancedColumnsUrl';
import {
  EXPANDED_ROW_PARAM,
  EFFECT_SIZE,
  MODES,
  STATS_TABLE,
  WARNINGS,
  serializeExpandedRow,
} from '../../utils/expandedRowUrl';
import { currentUrlParams } from '../../utils/tableStatePersistence';

const COLUMN_OPTIONS = [
  { key: CLIFFS_DELTA, label: "Cliff's Delta" },
  { key: CLES, label: 'CLES' },
  { key: SIGNIFICANCE, label: 'Significance' },
] as const;

const EXPANDED_OPTIONS = [
  {
    key: EFFECT_SIZE,
    field: 'effectSize',
    label: 'Effect size & confidence intervals',
  },
  { key: MODES, field: 'modes', label: 'Mode analysis' },
  { key: STATS_TABLE, field: 'statsTable', label: 'Statistics table' },
  { key: WARNINGS, field: 'warnings', label: 'Data warnings' },
] as const satisfies ReadonlyArray<{
  key: string;
  field: keyof ExpandedRowOptions;
  label: string;
}>;

function AdvancedOptionsMenu() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.theme.mode);
  const advancedColumns = useAdvancedColumns();
  const expandedRow = useExpandedRowOptions();
  const [, updateRawSearchParams] = useRawSearchParams();
  const { enqueueSnackbar } = useSnackbar();

  // Derive the selected option values from the same serializers used for the
  // URL, so the Select's value can't drift from the URL encoding.
  const selectedKeys = [
    ...(serializeAdvancedColumns(advancedColumns)?.split(',') ?? []),
    ...(serializeExpandedRow(expandedRow)?.split(',') ?? []),
  ];

  const applyAdvancedOptions = (keys: string[]) => {
    const columns: AdvancedColumns = {
      cliffsDelta: keys.includes(CLIFFS_DELTA),
      cles: keys.includes(CLES),
      significance: keys.includes(SIGNIFICANCE),
    };
    const expanded: ExpandedRowOptions = {
      effectSize: keys.includes(EFFECT_SIZE),
      modes: keys.includes(MODES),
      statsTable: keys.includes(STATS_TABLE),
      warnings: keys.includes(WARNINGS),
    };

    dispatch(updateShowCliffsDelta(columns.cliffsDelta));
    dispatch(updateShowCles(columns.cles));
    dispatch(updateShowSignificance(columns.significance));
    dispatch(updateExpandedRow(expanded));

    const added = EXPANDED_OPTIONS.find(
      ({ field }) => expanded[field] && !expandedRow[field],
    );
    if (added) {
      enqueueSnackbar(`${added.label} added to the expanded rows`, {
        variant: 'info',
        autoHideDuration: 3000,
      });
    }

    // Write both params onto the live URL so neither group clobbers the other.
    const params = currentUrlParams();
    const setOrDelete = (param: string, value: string | null) =>
      value ? params.set(param, value) : params.delete(param);
    setOrDelete(ADVANCED_COLUMNS_PARAM, serializeAdvancedColumns(columns));
    setOrDelete(EXPANDED_ROW_PARAM, serializeExpandedRow(expanded));
    updateRawSearchParams(params);
  };

  const onChange = (event: SelectChangeEvent<string[]>) => {
    const { value } = event.target;
    const keys = typeof value === 'string' ? value.split(',') : value;
    applyAdvancedOptions(keys);
  };

  const renderOption = ({ key, label }: { key: string; label: string }) => (
    <MenuItem key={key} value={key}>
      <Checkbox checked={selectedKeys.includes(key)} size='small' />
      <ListItemText primary={label} />
    </MenuItem>
  );

  return (
    <FormControl size='small' sx={{ width: 190 }}>
      <Select
        multiple
        displayEmpty
        data-testid='advanced-options-select'
        className='advanced-options-select'
        value={selectedKeys}
        onChange={onChange}
        renderValue={() => 'Advanced options'}
        variant='outlined'
        size='small'
        inputProps={{ 'aria-label': 'Advanced options' }}
        MenuProps={{
          disableScrollLock: true,
          classes: {
            paper: `paper-repo paper-${mode === 'light' ? 'light' : 'dark'}`,
          },
        }}
      >
        <ListSubheader>Advanced Columns</ListSubheader>
        {COLUMN_OPTIONS.map(renderOption)}
        <ListSubheader>Advanced expanded row details</ListSubheader>
        {EXPANDED_OPTIONS.map(renderOption)}
      </Select>
    </FormControl>
  );
}

export default AdvancedOptionsMenu;
