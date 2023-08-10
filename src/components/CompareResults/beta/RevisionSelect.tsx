import SortIcon from '@mui/icons-material/Sort';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import SvgIcon from '@mui/material/SvgIcon';
import { style } from 'typestyle';

import { useAppSelector } from '../../../hooks/app';
import useComparison from '../../../hooks/useComparison';

const styles = {
  box: style({
    display: 'flex',
    gap: '1px',
  }),
  select: style({
    width: '300px',
  }),
};

const revisionsOptions = [
  'All revisions',
  'bb6a5e451dac',
  '9d5066525489',
  'a998c42399a8',
];

function RevisionSelect() {
  const { handlerChangeComparison } = useComparison();
  const { activeComparison } = useAppSelector((state) => state.comparison);

  return (
    <Box data-testid={'revision-select'}>
      <Select
        className={styles.select}
        defaultValue=''
        displayEmpty
        size='small'
        renderValue={(value) => {
          return (
            <Box className={styles.box}>
              <SvgIcon>
                <SortIcon />
              </SvgIcon>
              {value}
            </Box>
          );
        }}
        onChange={(event) => handlerChangeComparison(event.target.value)}
        value={activeComparison}
      >
        {revisionsOptions.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
}

export default RevisionSelect;
