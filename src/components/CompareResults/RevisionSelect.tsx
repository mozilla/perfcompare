import SortIcon from '@mui/icons-material/Sort';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import SvgIcon from '@mui/material/SvgIcon';
import { useDispatch } from 'react-redux';
import { useLoaderData } from 'react-router-dom';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import { updateComparison } from '../../reducers/ComparisonSlice';
import { Strings } from '../../resources/Strings';
import { truncateHash } from '../../utils/helpers';
import type { LoaderReturnValue } from './loader';

const styles = {
  box: style({
    display: 'flex',
    gap: '1px',
  }),
  select: style({
    width: '100%',
  }),
};

const allRevisionsOption =
  Strings.components.comparisonRevisionDropdown.allRevisions;

function RevisionSelect() {
  const dispatch = useDispatch();
  const { newRevs } = useLoaderData() as LoaderReturnValue;
  const { activeComparison } = useAppSelector((state) => state.comparison);
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
              {value === allRevisionsOption.key
                ? allRevisionsOption.text
                : truncateHash(value)}
            </Box>
          );
        }}
        onChange={(event) => handlerChangeComparison(event.target.value)}
        value={activeComparison}
      >
        <MenuItem value={allRevisionsOption.key}>
          {allRevisionsOption.text}
        </MenuItem>
        {newRevs.map((rev) => (
          <MenuItem key={rev} value={rev}>
            {truncateHash(rev)}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
}

export default RevisionSelect;
