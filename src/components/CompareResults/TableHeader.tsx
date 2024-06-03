import CheckIcon from '@mui/icons-material/Check';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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

  return (
    <>
      <Button
        color='secondary'
        {...bindTrigger(popupState)}
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
        <ExpandMoreIcon />
      </Button>
      <Menu {...bindMenu(popupState)}>
        <MenuItem dense={true} onClick={onClear}>
          Clear filters
        </MenuItem>
        {possibleValues.map((possibleValue) => {
          const isChecked =
            !uncheckedValues || !uncheckedValues.has(possibleValue);
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
}

type TableHeaderProps = {
  cellsConfiguration: CompareResultsTableConfig[];
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
      gridTemplateColumns: '2fr 1fr 0.2fr 1fr 1fr 1fr 1fr 1fr 2fr 0.2fr',
      background:
        themeMode == 'light' ? Colors.Background100 : Colors.Background300Dark,
      borderRadius: '4px',
      padding: Spacing.Small,
      $nest: {
        '.cell': {
          borderBottom: 'none',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 0,
          margin: 0,
        },
        '.platform-header, .confidence-header': {
          width: '120px',
        },
        '.status-header': {
          width: '110px',
        },
        '.base-header, .new-header, .delta-header': {
          width: '85px',
        },
        '.confidence-header': {
          width: '140px',
        },
        '.runs-header': {
          textAlign: 'left',
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
