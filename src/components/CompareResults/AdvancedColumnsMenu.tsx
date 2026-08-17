import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import {
  usePopupState,
  bindTrigger,
  bindMenu,
} from 'material-ui-popup-state/hooks';

import { useAppDispatch } from '../../hooks/app';
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

// Dropdown that reveals a checkbox for each advanced statistics column
// (Cliff's Delta, CLES). Each is toggled independently — either, both, or
// neither can be shown. The selection is stored in the URL so a shared link
// reproduces it (via history.replaceState — no data refetch) and mirrored to
// Redux for reactive rendering. Shared by the main and subtests controls.
function AdvancedColumnsMenu() {
  const popupState = usePopupState({
    variant: 'popover',
    popupId: 'advanced-columns-menu',
  });
  const dispatch = useAppDispatch();
  const { cliffsDelta, cles } = useAdvancedColumns();
  const [rawSearchParams, updateRawSearchParams] = useRawSearchParams();

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

  const columns = [
    {
      label: "Cliff's Delta",
      checked: cliffsDelta,
      onChange: (checked: boolean) =>
        applyAdvancedColumns({ cliffsDelta: checked, cles }),
    },
    {
      label: 'CLES',
      checked: cles,
      onChange: (checked: boolean) =>
        applyAdvancedColumns({ cliffsDelta, cles: checked }),
    },
  ];

  return (
    <>
      <Tooltip title="Show the advanced statistics columns (Cliff's Delta, CLES)">
        <Button
          {...bindTrigger(popupState)}
          // Keep the accessible name as the visible label; without this MUI's
          // Tooltip would set the (Cliff's-Delta-mentioning) title as aria-label.
          aria-label='Advanced columns'
          color='inherit'
          size='small'
          endIcon={<KeyboardArrowDownIcon />}
          className='advanced-columns-button'
        >
          Advanced columns
        </Button>
      </Tooltip>
      <Menu {...bindMenu(popupState)}>
        {columns.map(({ label, checked, onChange }) => (
          <MenuItem
            disableRipple
            key={label}
            onClick={() => onChange(!checked)}
          >
            <FormControlLabel
              // Stop clicks on the checkbox/label from also bubbling to the
              // MenuItem's onClick, which would toggle a second time and cancel
              // out. The Checkbox's own onChange handles those clicks.
              onClick={(e) => e.stopPropagation()}
              control={
                <Checkbox
                  checked={checked}
                  onChange={(e) => onChange(e.target.checked)}
                  size='small'
                />
              }
              label={label}
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export default AdvancedColumnsMenu;
