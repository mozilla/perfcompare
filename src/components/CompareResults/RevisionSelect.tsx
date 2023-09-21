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

interface RevisionOption {
  [rev: string]: {
    key: string;
    text: string;
  };
}

const allRevisionsOption =
  Strings.components.comparisonRevisionDropdown.allRevisions;

const fakeRevisionsOptions: RevisionOption = {
  [allRevisionsOption.key]: allRevisionsOption,
  bb6a5e451dace3b9c7be42d24c9272738d73e6db: {
    key: 'bb6a5e451dace3b9c7be42d24c9272738d73e6db',
    text: truncateHash('bb6a5e451dace3b9c7be42d24c9272738d73e6db'),
  },
  '9d50665254899d8431813bdc04178e6006ce6d59': {
    key: '9d50665254899d8431813bdc04178e6006ce6d59',
    text: truncateHash('9d50665254899d8431813bdc04178e6006ce6d59'),
  },
  a998c42399a8fcea623690bf65bef49de20535b4: {
    key: 'a998c42399a8fcea623690bf65bef49de20535b4',
    text: truncateHash('a998c42399a8fcea623690bf65bef49de20535b4'),
  },
};

const formatRevisionsOptions = (revisions: string[]) => {
  const revisionsOptions: RevisionOption = {
    [allRevisionsOption.key]: allRevisionsOption,
  };
  revisions.forEach((rev) => {
    revisionsOptions[rev] = {
      key: rev,
      text: truncateHash(rev),
    };
  });
  return revisionsOptions;
};

function RevisionSelect() {
  const dispatch = useDispatch();
  const { activeComparison } = useAppSelector((state) => state.comparison);
  const activeComparisonOption = {
    key: activeComparison,
    text: truncateHash(activeComparison),
  };

  const newRevisions = useAppSelector(selectNewRevisions);
  const newRevisionsOption = formatRevisionsOptions(newRevisions);

  const [searchParams] = useSearchParams();
  const fakeDataParam: string | null = searchParams.get('fakedata');

  const revisionsOptions = fakeDataParam
    ? fakeRevisionsOptions
    : newRevisionsOption;

  const getShortHashOption = (value: string) => {
    return revisionsOptions[value].text;
  };

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
        value={activeComparisonOption.key}
      >
        {Object.values(revisionsOptions).map(({ key, text }) => {
          return (
            <MenuItem key={key} value={key}>
              {text}
            </MenuItem>
          );
        })}
      </Select>
    </Box>
  );
}

export default RevisionSelect;
