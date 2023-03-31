import SortIcon from '@mui/icons-material/Sort';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import SvgIcon from '@mui/material/SvgIcon';

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
        sx={{ width: 200 }}
        defaultValue=''
        displayEmpty
        size='small'
        renderValue={(value) => {
          return (
            <Box sx={{ display: 'flex', gap: 1 }}>
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
