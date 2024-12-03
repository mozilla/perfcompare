import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import StraightIcon from '@mui/icons-material/Straight';
import SwapVert from '@mui/icons-material/SwapVert';
import { ListItemIcon, ListItemText } from '@mui/material';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Box } from '@mui/system';
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
  CompareResultsTableCell,
} from '../../types/types';

function SortDirectionIcon({
  columnName,
  sortDirection,
}: {
  columnName: string;
  sortDirection: SortableColumnProps['sortDirection'];
}) {
  const commonStyle = { marginInlineEnd: 1, marginInlineStart: -0.5 };
  switch (sortDirection) {
    case 'asc':
      return (
        <StraightIcon
          titleAccess={`Sorted by ${columnName} in ascending order`}
          fontSize='small'
          sx={commonStyle}
        />
      );
    case 'desc':
      return (
        <StraightIcon
          titleAccess={`Sorted by ${columnName} in descending order`}
          fontSize='small'
          sx={{
            ...commonStyle,
            transform: 'scale(-1)',
          }}
        />
      );
    default:
      return (
        <SwapVert
          titleAccess={`Not sorted by ${columnName}`}
          fontSize='small'
          sx={commonStyle}
        />
      );
  }
}

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
  const possibleCheckedValues =
    possibleValues.length - (uncheckedValues?.size || 0);

  const onClickFilter = (valueKey: string) => {
    const newUncheckedValues = new Set(uncheckedValues);
    if (newUncheckedValues.has(valueKey)) {
      newUncheckedValues.delete(valueKey);
    } else {
      newUncheckedValues.add(valueKey);
    }
    onToggle(newUncheckedValues);
  };

  const onClickOnlyFilter = (valueKey: string) => {
    const newUncheckedValues = new Set(
      possibleValues
        .filter(({ key }) => key !== valueKey)
        .map(({ key }) => key),
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
          borderRadius: 0.5,
          padding: '6px 12px',
        })}
      >
        {name}
        <Box
          sx={{
            paddingInlineStart: 0.5,
            color: 'primary.main',
          }}
          aria-label={`${possibleCheckedValues} items selected`}
        >
          ({possibleCheckedValues})
        </Box>
        <KeyboardArrowDownIcon />
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
            onClick={() => onClickOnlyFilter(possibleValue.key)}
          >
            Select only “{possibleValue.label}”
          </MenuItem>
        ))}
        <Divider />
        {possibleValues.map((possibleValue) => {
          const isChecked =
            !uncheckedValues || !uncheckedValues.has(possibleValue.key);
          return (
            <MenuItem
              dense
              key={possibleValue.key}
              role='menuitemcheckbox'
              aria-checked={isChecked ? 'true' : 'false'}
              aria-label={`${possibleValue.label}${
                isChecked ? ' (selected)' : ''
              }`}
              onClick={() => onClickFilter(possibleValue.key)}
            >
              <ListItemIcon>
                <Checkbox
                  checked={isChecked}
                  tabIndex={-1}
                  disableRipple
                  sx={{ padding: 0 }}
                />
              </ListItemIcon>
              <ListItemText primary={possibleValue.label} />
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}

type SortableColumnProps = {
  name: string;
  sortDirection: 'asc' | 'desc' | null;
  onToggle: (sortDirection: SortableColumnProps['sortDirection']) => void;
};

function SortableColumn({
  name,
  sortDirection,
  onToggle,
}: SortableColumnProps) {
  const buttonAriaLabel = sortDirection
    ? `${name} (Currently sorted by this column. Click to change)`
    : `${name} (Click to sort by this column)`;

  function onButtonClick() {
    let newSortDirection: typeof sortDirection;
    switch (sortDirection) {
      case 'asc':
        newSortDirection = 'desc';
        break;
      case 'desc':
        newSortDirection = null;
        break;
      default:
        newSortDirection = 'asc';
    }

    onToggle(newSortDirection);
  }

  return (
    <Button
      color='secondary'
      aria-label={buttonAriaLabel}
      sx={(theme) => ({
        background:
          theme.palette.mode == 'light'
            ? Colors.Background200
            : Colors.Background200Dark,
        borderRadius: 0.5,
        padding: '6px 12px',
      })}
      onClick={onButtonClick}
    >
      <SortDirectionIcon columnName={name} sortDirection={sortDirection} />
      {name}
    </Button>
  );
}

type TableHeaderProps = {
  cellsConfiguration: CompareResultsTableConfig;

  // Filter properties
  filters: Map<string, Set<string>>;
  onToggleFilter: (columnId: string, filters: Set<string>) => unknown;
  onClearFilter: (columnId: string) => unknown;

  // Sort properties
  sortColumn: null | string;
  sortDirection: SortableColumnProps['sortDirection'];
  onToggleSort: (
    columnId: string,
    sortDirection: TableHeaderProps['sortDirection'],
  ) => void;
};

function TableHeader({
  cellsConfiguration,
  filters,
  onToggleFilter,
  onClearFilter,
  sortColumn,
  sortDirection,
  onToggleSort,
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
      paddingBlock: Spacing.Small,
      marginTop: Spacing.Medium,
      marginBottom: Spacing.Large,
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
        '.subtests-header': {
          justifySelf: 'start',
          paddingInlineStart: Spacing.Medium, // Synchronize with the subtests row
        },
        '.platform-header': {
          justifySelf: 'start',
          paddingInlineStart: Spacing.xLarge, // Synchronize with the platform row
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

  function renderColumnHeader(header: CompareResultsTableCell) {
    if ('filter' in header) {
      return (
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
      );
    }

    if ('sortFunction' in header) {
      return (
        <SortableColumn
          name={header.name}
          sortDirection={header.key === sortColumn ? sortDirection : null}
          onToggle={(newSortDirection) =>
            onToggleSort(header.key, newSortDirection)
          }
        />
      );
    }

    return header.name;
  }

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
          {renderColumnHeader(header)}
        </div>
      ))}
    </div>
  );
}

export default TableHeader;
