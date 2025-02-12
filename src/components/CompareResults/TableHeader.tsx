import { ReactNode } from 'react';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import StraightIcon from '@mui/icons-material/Straight';
import SwapVert from '@mui/icons-material/SwapVert';
import { ListItemIcon, ListItemText, Tooltip, Box } from '@mui/material';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { SxProps, Theme } from '@mui/material/styles';
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
  sx,
}: {
  columnName: string;
  sortDirection: SortableColumnHeaderProps['sortDirection'];
  sx?: SxProps<Theme>;
}) {
  switch (sortDirection) {
    case 'asc':
      return (
        <StraightIcon
          titleAccess={`Sorted by ${columnName} in ascending order`}
          fontSize='small'
          sx={sx}
        />
      );
    case 'desc':
      return (
        <StraightIcon
          titleAccess={`Sorted by ${columnName} in descending order`}
          fontSize='small'
          sx={{
            ...sx,
            transform: 'scale(-1)',
          }}
        />
      );
    default:
      return (
        <SwapVert
          titleAccess={`Not sorted by ${columnName}`}
          fontSize='small'
          sx={sx}
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
      <Button
        {...bindTrigger(popupState)}
        color='tableHeaderButton'
        size='small'
        aria-label={buttonAriaLabel}
        sx={{ paddingInline: 1.5 }}
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
  displayLabel: boolean;
  sortDirection: 'asc' | 'desc' | null;
  onToggle: (sortDirection: SortableColumnHeaderProps['sortDirection']) => void;
};

function SortableColumnHeader({
  name,
  displayLabel,
  sortDirection,
  onToggle,
}: SortableColumnHeaderProps) {
  const buttonAriaLabel = sortDirection
    ? `${name} (Currently sorted by this column. Click to change)`
    : `${name} (Click to sort by this column)`;

  function onButtonClick() {
    let newSortDirection: typeof sortDirection;
    switch (sortDirection) {
      case 'desc':
        newSortDirection = 'asc';
        break;
      case 'asc':
        newSortDirection = null;
        break;
      default:
        newSortDirection = 'desc';
    }

    onToggle(newSortDirection);
  }

  // MUI sets a minWidth of 40px using 2 classes, it's not appropriate for icons and difficult to override without !important.
  const inlineStyle = displayLabel
    ? { padding: '6px 12px' }
    : { padding: 0, minWidth: '24px !important' };
  // Have some margin between the icon and the text, and some less margin at the
  // start, but only when there's some actual text.
  const inlineIconStyle = displayLabel
    ? { marginInlineEnd: 1, marginInlineStart: -0.5 }
    : null;

  return (
    <Button
      color='tableHeaderButton'
      aria-label={buttonAriaLabel}
      size='small'
      onClick={onButtonClick}
      sx={inlineStyle}
    >
      <SortDirectionIcon
        columnName={name}
        sortDirection={sortDirection}
        sx={inlineIconStyle}
      />
      {displayLabel ? name : null}
    </Button>
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
      lineHeight: '1.5',
    }),
  };

  function renderColumnHeader(header: CompareResultsTableColumn) {
    let content: ReactNode = header.name;

    if ('sortFunction' in header && 'filter' in header) {
      content = (
        <ButtonGroup
          variant='contained'
          color='tableHeaderButton'
          disableElevation
        >
          <SortableColumnHeader
            name={header.name}
            displayLabel={false}
            sortDirection={header.key === sortColumn ? sortDirection : null}
            onToggle={(newSortDirection) =>
              onToggleSort(header.key, newSortDirection)
            }
          />
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
        </ButtonGroup>
      );
    } else if ('sortFunction' in header) {
      content = (
        <SortableColumnHeader
          name={header.name}
          displayLabel={true}
          sortDirection={header.key === sortColumn ? sortDirection : null}
          onToggle={(newSortDirection) =>
            onToggleSort(header.key, newSortDirection)
          }
        />
      );
    } else if ('filter' in header) {
      content = (
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
      );
    }

    if (header.tooltip) {
      return (
        <Tooltip
          title={header.tooltip}
          placement='top'
          arrow
          classes={{ tooltip: styles.typography }}
        >
          {/* Box is used because tooltip expects a single valid element but sometimes content is a string */}
          <Box component='span' sx={{ cursor: 'pointer' }}>
            {content}
          </Box>
        </Tooltip>
      );
    }

    return content;
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
