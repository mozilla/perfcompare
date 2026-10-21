import { useRef } from 'react';

import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import {
  DEFAULT_FRAMEWORK_ID,
  frameworks,
  sortedFrameworks,
} from '../../common/constants';
import { Strings } from '../../resources/Strings';
import { ThemeMode } from '../../types/state';
import type { Framework } from '../../types/types';

const strings = Strings.components.searchDefault.sharedCollasped.framework;

// Internal value used by the "All frameworks" checkbox. It's never stored in
// the selection nor submitted: checking it expands to every framework id.
const ALL_FRAMEWORKS_VALUE = 'all-frameworks';

// At most this many framework names are shown in the closed dropdown before
// the summary is truncated with a "+ N others" suffix.
const MAX_VISIBLE_FRAMEWORK_NAMES = 3;

function summarizeSelectedNames(names: string[]): {
  visibleNames: string[];
  remainingCount: number;
} {
  if (names.length <= MAX_VISIBLE_FRAMEWORK_NAMES) {
    return { visibleNames: names, remainingCount: 0 };
  }
  return {
    visibleNames: names.slice(0, MAX_VISIBLE_FRAMEWORK_NAMES),
    remainingCount: names.length - MAX_VISIBLE_FRAMEWORK_NAMES,
  };
}

interface FrameworkMultiSelectProps {
  selection: Framework['id'][];
  onChange: (selection: Framework['id'][]) => void;
  mode: ThemeMode;
  // When provided, hidden inputs submit one `framework` param per selected id.
  name?: string;
  labelId?: string;
  size?: 'small' | 'medium';
  variant?: 'standard' | 'outlined' | 'filled';
  onMenuClose?: () => void;
}

function FrameworkMultiSelect({
  selection,
  onChange,
  mode,
  name,
  labelId,
  size,
  variant,
  onMenuClose,
}: FrameworkMultiSelectProps) {
  const allFrameworkIds = frameworks.map((framework) => framework.id);
  const isAllSelected = allFrameworkIds.every((id) => selection.includes(id));

  // The selection from before "All frameworks" was checked, so that unchecking
  // it restores what the user had. It's null when "All frameworks" arrives
  // already checked (e.g. a URL listing every framework), in which case
  // unchecking it falls back to talos.
  const selectionBeforeAllRef = useRef<Framework['id'][] | null>(null);

  // When everything is selected, the sentinel is part of the Select's value
  // too, so the "All frameworks" option reports its selected state correctly.
  const selectValue = isAllSelected
    ? [ALL_FRAMEWORKS_VALUE, ...selection.map(String)]
    : selection.map(String);

  const onValueChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    const keys = typeof value === 'string' ? value.split(',') : value;

    if (isAllSelected) {
      if (keys.includes(ALL_FRAMEWORKS_VALUE)) {
        // An individual framework was unchecked while "All frameworks" was
        // checked: keep the remaining frameworks selected.
        const remainingIds = keys
          .filter((key) => key !== ALL_FRAMEWORKS_VALUE)
          .map((key) => +key as Framework['id'])
          .filter((id) => allFrameworkIds.includes(id));
        onChange(remainingIds.length ? remainingIds : [DEFAULT_FRAMEWORK_ID]);
      } else {
        // "All frameworks" was unchecked: restore the selection from before it
        // was checked, or talos when there's nothing to restore.
        const previousSelection = selectionBeforeAllRef.current;
        onChange(
          previousSelection?.length
            ? previousSelection
            : [DEFAULT_FRAMEWORK_ID],
        );
      }
      return;
    }

    if (keys.includes(ALL_FRAMEWORKS_VALUE)) {
      // "All frameworks" was checked: remember the selection it replaces.
      selectionBeforeAllRef.current = selection;
      onChange(allFrameworkIds);
      return;
    }

    const frameworkIds = keys.map((id) => +id as Framework['id']);

    // The selection is never empty: unchecking the last framework falls back
    // to talos, the default framework.
    onChange(frameworkIds.length ? frameworkIds : [DEFAULT_FRAMEWORK_ID]);
  };

  const selectedNames = sortedFrameworks
    .filter(([id]) => selection.includes(+id as Framework['id']))
    .map(([, frameworkName]) => frameworkName);

  return (
    <>
      {/****
        The Select is deliberately unnamed: MUI joins multiple values with
        commas in its native input. These hidden inputs submit each selected
        framework as its own `framework` parameter instead.
      ****/}
      {name &&
        selection.map((id) => (
          <input type='hidden' value={id} name={name} key={id}></input>
        ))}
      <Select
        multiple
        displayEmpty
        data-testid='framework-select'
        value={selectValue}
        labelId={labelId}
        className='framework-dropdown-select'
        onChange={onValueChange}
        onClose={onMenuClose}
        renderValue={() => {
          if (isAllSelected) {
            return strings.allFrameworks;
          }

          // The names shrink (with an ellipsis) while the "+ N others" suffix
          // always stays visible, so the trigger width can stay fixed.
          const { visibleNames, remainingCount } =
            summarizeSelectedNames(selectedNames);
          return (
            <Box
              component='span'
              sx={{
                display: 'flex',
                alignItems: 'baseline',
                width: '100%',
                minWidth: 0,
              }}
            >
              <Box
                component='span'
                data-testid='framework-summary-names'
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  minWidth: 0,
                }}
              >
                {visibleNames.join(', ')}
              </Box>
              {remainingCount > 0 && (
                <Box
                  component='span'
                  data-testid='framework-summary-remaining'
                  sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
                >
                  {' '}
                  {strings.moreFrameworks(remainingCount)}
                </Box>
              )}
            </Box>
          );
        }}
        variant={variant}
        size={size}
        MenuProps={{
          classes: {
            paper: `paper-repo paper-${mode === 'light' ? 'light' : 'dark'}`,
          },
        }}
        inputProps={{
          'aria-label': 'Framework',
        }}
      >
        {/****
          The "All frameworks" checkbox selects every framework. Unchecking it
          restores the selection from before it was checked, or talos when
          there's nothing to restore.
        ****/}
        <MenuItem
          value={ALL_FRAMEWORKS_VALUE}
          className={`framework-dropdown-item`}
        >
          <Checkbox checked={isAllSelected} size='small' />
          <ListItemText primary={strings.allFrameworks} />
        </MenuItem>
        {sortedFrameworks.map(([id, frameworkName]) => (
          <MenuItem
            value={id}
            key={frameworkName}
            className={`framework-dropdown-item`}
          >
            <Checkbox
              checked={selection.includes(+id as Framework['id'])}
              size='small'
            />
            <ListItemText primary={frameworkName} />
          </MenuItem>
        ))}
      </Select>
    </>
  );
}

export default FrameworkMultiSelect;
