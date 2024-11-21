import CheckIcon from '@mui/icons-material/Check';
import FilterListIcon from '@mui/icons-material/FilterList';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
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
import type {
  CompareResultsTableConfig,
  CompareResultsTableFilterableCell,
} from '../../types/types';

type FilterableColumnProps = {
  name: string;
  columnId: string;
  possibleValues: CompareResultsTableFilterableCell['possibleValues'];
  uncheckedValues?: Set<string>;
  onToggle: (checkedValues: Set<string>) => unknown;
  onClear: () => unknown;
};

function FilterableColumn({
  name,
  columnId,
  possibleValues,
  uncheckedValues,
  onToggle,
  onClear,
}: FilterableColumnProps) {
  const popupState = usePopupState({ variant: 'popover', popupId: columnId });

  const onClickFilter = (value: string) => {
    const newUncheckedValues = new Set(uncheckedValues);
    if (newUncheckedValues.has(value)) {
      newUncheckedValues.delete(value);
    } else {
      newUncheckedValues.add(value);
    }
    onToggle(newUncheckedValues);
  };

  const onClickOnlyFilter = (value: string) => {
    const newUncheckedValues = new Set(
      possibleValues
        .filter(({ label }) => label !== value)
        .map(({ label }) => label),
    );
    onToggle(newUncheckedValues);
  };

  const hasFilteredValues = uncheckedValues && uncheckedValues.size;
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
            theme.palette.mode == 'light'
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
          Select all values
        </MenuItem>
        <Divider />
        {possibleValues.map((possibleValue) => (
          <MenuItem
            dense={true}
            key={possibleValue.key}
            onClick={() => onClickOnlyFilter(possibleValue.label)}
          >
            Select only “{possibleValue.label}”
          </MenuItem>
        ))}
        <Divider />
        {possibleValues.map((possibleValue) => {
          const isChecked =
            !uncheckedValues || !uncheckedValues.has(possibleValue.label);
          return (
            <MenuItem
              dense={true}
              key={possibleValue.key}
              role='menuitemcheckbox'
              aria-checked={isChecked ? 'true' : 'false'}
              aria-label={`${possibleValue.label}${
                isChecked ? ' (selected)' : ''
              }`}
              onClick={() => onClickFilter(possibleValue.label)}
            >
              {isChecked ? <CheckIcon fontSize='small' /> : null}
              {possibleValue.label}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}

type TableHeaderProps = {
  cellsConfiguration: CompareResultsTableConfig;
  filters: Map<string, Set<string>>;
  onToggleFilter: (columnId: string, filters: Set<string>) => unknown;
  onClearFilter: (columnId: string) => unknown;
};

function TableHeader({
  cellsConfiguration,
  filters,
  onToggleFilter,
  onClearFilter,
}: TableHeaderProps) {
  const themeMode = useAppSelector((state) => state.theme.mode);
  const styles = {
    tableHeader: style({
      display: 'grid',
      // Should be kept in sync with the gridTemplateColumns from RevisionRow
      gridTemplateColumns: cellsConfiguration
        .map((config) => config.gridWidth)
        .join(' '),
      background:
        themeMode == 'light' ? Colors.Background100 : Colors.Background300Dark,
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
              uncheckedValues={filters.get(header.key)}
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
}

export default TableHeader;
