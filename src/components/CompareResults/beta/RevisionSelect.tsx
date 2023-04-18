import SortIcon from '@mui/icons-material/Sort';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import SvgIcon from '@mui/material/SvgIcon';
import { style } from 'typestyle'; 

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
  '6064a73fc99f',
  'bc44c46861dd',
  '3bebf28f32a7',
];

function RevisionSelect() {
  return (
    <Box data-testid={'revision-select'}>
      <Select
        disabled // To be removed
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
