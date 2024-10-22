import CheckIcon from '@mui/icons-material/Check';
import FilterListIcon from '@mui/icons-material/FilterList';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import {
  usePopupState,
  bindTrigger,
  bindMenu,
} from 'material-ui-popup-state/hooks';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import { Colors, Spacing } from '../../styles';
import type { CompareResultsTableConfig } from '../../types/types';

type FilterableColumnProps = {
  name: string;
  columnId: string;
  possibleValues: string[];
  checkedValues: Set<string>; // track checked values explicitly now
  onToggle: (checkedValues: Set<string>) => void;
  onClear: () => void;
};

const FilterableColumn: React.FC<FilterableColumnProps> = ({
  name,
  columnId,
  possibleValues,
  checkedValues, // the set of values that are checked (selected)
  onToggle,
  onClear,
}) => {
  const popupState = usePopupState({ variant: 'popover', popupId: columnId });

  const onClickFilter = (value: string) => {
    // Create a new Set to avoid mutating the original one
    const newCheckedValues = new Set(checkedValues);

    // Toggle the selection state of the value
    if (newCheckedValues.has(value)) {
      newCheckedValues.delete(value); // Deselect
    } else {
      newCheckedValues.add(value); // Select
    }

    onToggle(newCheckedValues); // Pass the new Set to the parent
  };

  const hasFilteredValues = checkedValues.size < possibleValues.length;
  const buttonAriaLabel = hasFilteredValues
    ? `${name} (Click to filter values. Some filters are active.)`
    : `${name} (Click to filter values)`;

  return (
    <>
      <Button
        color='secondary'
        {...bindTrigger(popupState)}
        aria-label={buttonAriaLabel}
        sx={(theme) => ({
          background:
            theme.palette.mode === 'light'
              ? Colors.Background200
              : Colors.Background200Dark,
          borderRadius: '4px',
          fontSize: 'inherit',
        })}
      >
        {name}
        <FilterListIcon
          fontSize='small'
          color={hasFilteredValues ? 'primary' : 'inherit'}
          sx={{ marginInlineStart: 1 }}
          titleAccess={
            hasFilteredValues ? 'Some filters are active' : 'No active filters'
          }
        />
      </Button>
      <Menu {...bindMenu(popupState)}>
        <MenuItem dense={true} onClick={onClear}>
          Clear filters
        </MenuItem>
        {possibleValues.map((possibleValue) => {
          const isChecked = checkedValues.has(possibleValue); // Checked if it exists in checkedValues set
          return (
            <MenuItem
              dense={true}
              key={possibleValue}
              role='menuitemcheckbox'
              aria-checked={isChecked ? 'true' : 'false'}
              aria-label={`${possibleValue}${isChecked ? ' (selected)' : ''}`}
              onClick={() => onClickFilter(possibleValue)}
            >
              {isChecked ? <CheckIcon fontSize='small' /> : null}
              {possibleValue}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

type TableHeaderProps = {
  cellsConfiguration: CompareResultsTableConfig[];
  filters: Map<string, Set<string>>; // Filters for each column, using Map
  onToggleFilter: (columnId: string, filters: Set<string>) => void;
  onClearFilter: (columnId: string) => void;
};

const TableHeader: React.FC<TableHeaderProps> = ({
  cellsConfiguration,
  filters,
  onToggleFilter,
  onClearFilter,
}) => {
  const themeMode = useAppSelector((state) => state.theme.mode);

  const styles = {
    tableHeader: style({
      display: 'grid',
      gridTemplateColumns: cellsConfiguration
        .map((config) => config.gridWidth)
        .join(' '),
      background:
        themeMode === 'light' ? Colors.Background100 : Colors.Background300Dark,
      borderRadius: '4px',
      padding: Spacing.Small,
      marginTop: Spacing.Medium,
      $nest: {
        '.cell': {
          borderBottom: 'none',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 0,
          margin: 0,
          fontWeight: 700,
        },
        '& .runs-header, & .platform-header': {
          justifySelf: 'left',
          marginLeft: 8,
        },
        '.subtests-header': {
          justifySelf: 'left',
          marginLeft: 24,
        },
      },
    }),

    typography: style({
      fontFamily: 'SF Pro',
      fontStyle: 'normal',
      fontWeight: 590,
      fontSize: '13px',
      lineHeight: '16px',
    }),
  };

  return (
    <div
      className={`${styles.tableHeader} ${styles.typography}`}
      data-testid='table-header'
      role='row'
    >
      {cellsConfiguration.map((header) => (
        <div
          key={`${header.key}`}
          className={`cell ${header.key}-header`}
          role='columnheader'
        >
          {header.filter ? (
            <FilterableColumn
              possibleValues={header.possibleValues}
              name={header.name}
              columnId={header.key}
              checkedValues={
                filters.get(header.key) || new Set(['High']) // Default is only "High" checked
              }
              onClear={() => onClearFilter(header.key)}
              onToggle={(checkedValues) =>
                onToggleFilter(header.key, checkedValues)
              }
            />
          ) : (
            header.name
          )}
        </div>
      ))}
    </div>
  );
};

export default TableHeader;
