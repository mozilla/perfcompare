import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import StraightIcon from '@mui/icons-material/Straight';
import SwapVert from '@mui/icons-material/SwapVert';
import { ListItemIcon, ListItemText } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
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
  FilterableColumn,
  CompareResultsTableColumn,
} from '../../types/types';

function SortDirectionIcon({
  columnName,
  sortDirection,
}: {
  columnName: string;
  sortDirection: SortableColumnHeaderProps['sortDirection'];
}) {
  switch (sortDirection) {
    case 'asc':
      return (
        <StraightIcon
          titleAccess={`Sorted by ${columnName} in ascending order`}
          fontSize='small'
        />
      );
    case 'desc':
      return (
        <StraightIcon
          titleAccess={`Sorted by ${columnName} in descending order`}
          fontSize='small'
          sx={{
            transform: 'scale(-1)',
          }}
        />
      );
    default:
      return (
        <SwapVert
          titleAccess={`Not sorted by ${columnName}`}
          fontSize='small'
        />
      );
  }
}

type FilterableColumnHeaderProps = {
  name: string;
  columnId: string;

  /* Properties for filtering */
  possibleValues: FilterableColumn['possibleValues'];
  uncheckedValues?: Set<string>;
  onToggleFilter: (checkedValues: Set<string>) => unknown;
  onClearFilter: () => unknown;
};

function FilterableColumnHeader({
  name,
  columnId,
  possibleValues,
  uncheckedValues,
  onToggleFilter,
  onClearFilter,
}: FilterableColumnHeaderProps) {
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
    onToggleFilter(newUncheckedValues);
  };

  const onClickOnlyFilter = (valueKey: string) => {
    const newUncheckedValues = new Set(
      possibleValues
        .filter(({ key }) => key !== valueKey)
        .map(({ key }) => key),
    );
    onToggleFilter(newUncheckedValues);
  };

  const hasFilteredValues = uncheckedValues && uncheckedValues.size;
  const buttonAriaLabel = hasFilteredValues
    ? `${name} (Click to filter values. Some filters are active.)`
    : `${name} (Click to filter values)`;

  return (
    <>
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
      <IconButton
        {...bindTrigger(popupState)}
        size='small'
        aria-label={buttonAriaLabel}
      >
        <KeyboardArrowDownIcon fontSize='small' />
      </IconButton>
      <Menu {...bindMenu(popupState)}>
        <MenuItem dense={true} onClick={onClearFilter}>
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

type SortableColumnHeaderProps = {
  name: string;
  sortDirection: 'asc' | 'desc' | null;
  onToggle: (sortDirection: SortableColumnHeaderProps['sortDirection']) => void;
};

function SortableColumnHeader({
  name,
  sortDirection,
  onToggle,
}: SortableColumnHeaderProps) {
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
    <IconButton
      aria-label={buttonAriaLabel}
      size='small'
      onClick={onButtonClick}
    >
      <SortDirectionIcon columnName={name} sortDirection={sortDirection} />
    </IconButton>
  );
}

type TableHeaderProps = {
  columnsConfiguration: CompareResultsTableConfig;

  // Filter properties
  filters: Map<string, Set<string>>;
  onToggleFilter: (columnId: string, filters: Set<string>) => unknown;
  onClearFilter: (columnId: string) => unknown;

  // Sort properties
  sortColumn: null | string;
  sortDirection: SortableColumnHeaderProps['sortDirection'];
  onToggleSort: (
    columnId: string,
    sortDirection: TableHeaderProps['sortDirection'],
  ) => void;
};

function TableHeader({
  columnsConfiguration,
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
      gridTemplateColumns: columnsConfiguration
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

  function renderColumnHeader(header: CompareResultsTableColumn) {
    return (
      <>
        {'filter' in header ? (
          <FilterableColumnHeader
            possibleValues={header.possibleValues}
            name={header.name}
            columnId={header.key}
            uncheckedValues={filters.get(header.key)}
            onClearFilter={() => onClearFilter(header.key)}
            onToggleFilter={(checkedValues) =>
              onToggleFilter(header.key, checkedValues)
            }
          />
        ) : (
          header.name
        )}
        {'sortFunction' in header ? (
          <SortableColumnHeader
            name={header.name}
            sortDirection={header.key === sortColumn ? sortDirection : null}
            onToggle={(newSortDirection) =>
              onToggleSort(header.key, newSortDirection)
            }
          />
        ) : null}
      </>
    );
  }

  return (
    <div
      className={`${styles.tableHeader} ${styles.typography}`}
      data-testid='table-header'
      role='row'
    >
      {columnsConfiguration.map((header) => (
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
