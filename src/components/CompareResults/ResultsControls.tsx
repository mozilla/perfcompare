import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import { style } from 'typestyle';

import AdvancedColumnsMenu from './AdvancedColumnsMenu';
import { DownloadButton } from './DownloadButton';
import RevisionSelect from './RevisionSelect';
import SearchInput from './SearchInput';
import { useAppDispatch, useAppSelector } from '../../hooks/app';
import { updateShowHowToRead } from '../../reducers/ColumnPrefsSlice';
import { Strings } from '../../resources/Strings';
import type { CombinedResultsItemType } from '../../types/state';
import type { Framework, TestVersion } from '../../types/types';
import FrameworkDropdown from '../Shared/FrameworkDropdown';
import TestVersionDropdown from '../Shared/TestVersionDropdown';

const controlsStyles = style({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
});

interface Props {
  initialSearchTerm: string;
  frameworkId: Framework['id'];
  testType?: TestVersion;
  resultsPromise: Promise<CombinedResultsItemType[][]>;
  expandAll: boolean;
  onSearchTermChange: (searchTerm: string) => unknown;
  onFrameworkChange: (frameworkId: Framework['id']) => unknown;
  onTestVersionChange: (testType: TestVersion) => void;
  onExpandAllChange: (checked: boolean) => void;
}
export default function ResultsControls({
  initialSearchTerm,
  frameworkId,
  testType,
  resultsPromise,
  expandAll,
  onSearchTermChange,
  onFrameworkChange,
  onTestVersionChange,
  onExpandAllChange,
}: Props) {
  const mode = useAppSelector((state) => state.theme.mode);
  const dispatch = useAppDispatch();
  const showHowToRead = useAppSelector(
    (state) => state.columnPrefs.showHowToRead,
  );
  const onShowHowToReadChange = (checked: boolean) => {
    dispatch(updateShowHowToRead(checked));
    localStorage.setItem('showHowToRead', String(checked));
  };
  return (
    <Grid
      container
      className={`${controlsStyles} results-controls`}
      spacing={2}
    >
      {/* Group 1: the input controls. Grows to fill the available width, and
        stacks full-width above the selections group once the screen narrows. */}
      <Grid size={{ xs: 12, md: 'grow' }}>
        <Grid container spacing={2} className='results-controls-inputs'>
          <Grid
            size={{
              md: 3,
              xs: 12,
            }}
          >
            <SearchInput
              defaultValue={initialSearchTerm}
              onChange={onSearchTermChange}
              strings={Strings.components.searchResultsInput}
            />
          </Grid>
          <Grid
            size={{
              md: 2,
              xs: 6,
            }}
          >
            <FormControl sx={{ width: '100%' }}>
              <FrameworkDropdown
                frameworkId={frameworkId}
                size='small'
                variant='outlined'
                mode={mode}
                onChange={onFrameworkChange}
              />
            </FormControl>
          </Grid>
          <Grid
            size={{
              md: 2,
              xs: 6,
            }}
          >
            <FormControl sx={{ width: '100%' }}>
              <TestVersionDropdown
                testType={testType}
                size='small'
                variant='outlined'
                mode={mode}
                onChange={onTestVersionChange}
              />
            </FormControl>
          </Grid>
          <Grid size='grow' sx={{ minWidth: 150 }}>
            <RevisionSelect />
          </Grid>
          <Grid size='grow' sx={{ minWidth: 140 }}>
            <DownloadButton resultsPromise={resultsPromise} />
          </Grid>
        </Grid>
      </Grid>

      {/* Group 2: the checkbox-style selections. Sits as a compact column on
        the right on wide screens; drops to a full-width wrapping row below the
        inputs on narrow screens, spreading out to use the available space. */}
      <Grid size={{ xs: 12, md: 'auto' }}>
        <Box
          className='results-controls-selections'
          sx={{
            display: 'flex',
            flexDirection: { xs: 'row', md: 'column' },
            flexWrap: 'wrap',
            columnGap: 2,
            alignItems: { xs: 'center', md: 'flex-start' },
            whiteSpace: 'nowrap',
          }}
        >
          <AdvancedColumnsMenu />
          <Tooltip title='Show the "How to read the results" guide above the table'>
            <FormControlLabel
              control={
                <Checkbox
                  checked={showHowToRead}
                  onChange={(e) => onShowHowToReadChange(e.target.checked)}
                  size='small'
                />
              }
              label='How to read the results'
            />
          </Tooltip>
          <Tooltip title='Expand all rows'>
            <FormControlLabel
              control={
                <Checkbox
                  checked={expandAll}
                  onChange={(e) => onExpandAllChange(e.target.checked)}
                  size='small'
                />
              }
              label='Expand all'
            />
          </Tooltip>
        </Box>
      </Grid>
    </Grid>
  );
}
