import SortIcon from '@mui/icons-material/Sort';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import SvgIcon from '@mui/material/SvgIcon';
import { useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import {
  selectNewRevisions,
  updateComparison,
} from '../../reducers/ComparisonSlice';
import { Strings } from '../../resources/Strings';
import { truncateHash } from '../../utils/helpers';

const styles = {
  box: style({
    display: 'flex',
    gap: '1px',
  }),
  select: style({
    width: '300px',
  }),
};

const allRevisionsOption =
  Strings.components.comparisonRevisionDropdown.allRevisions;

const fakeRevisionsOptions = [
  allRevisionsOption,
  'bb6a5e451dace3b9c7be42d24c9272738d73e6db',
  '9d50665254899d8431813bdc04178e6006ce6d59',
  'a998c42399a8fcea623690bf65bef49de20535b4',
];

function RevisionSelect() {
  const dispatch = useDispatch();
  const { activeComparison } = useAppSelector((state) => state.comparison);

  const newRevisions = useAppSelector(selectNewRevisions);

  const [searchParams] = useSearchParams();
  const fakeDataParam: string | null = searchParams.get('fakedata');

  const revisionsOptions = fakeDataParam
    ? fakeRevisionsOptions
    : [allRevisionsOption, ...newRevisions];

  const getShortHashOption = (value: string) =>
    value === allRevisionsOption ? allRevisionsOption : truncateHash(value);

  const handlerChangeComparison = (option: string) => {
    dispatch(updateComparison({ activeComparison: option }));
  };

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
              {getShortHashOption(value)}
            </Box>
          );
        }}
        onChange={(event) => handlerChangeComparison(event.target.value)}
        value={activeComparison}
      >
        {revisionsOptions.map((option) => (
          <MenuItem key={option} value={option}>
            {getShortHashOption(option)}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
}

export default RevisionSelect;
