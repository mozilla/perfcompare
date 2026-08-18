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
import {
  updateShowHowToRead,
  HOW_TO_READ_STORAGE_KEY,
} from '../../reducers/ColumnPrefsSlice';
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
    localStorage.setItem(HOW_TO_READ_STORAGE_KEY, String(checked));
  };
  return (
    <Grid
      container
      className={`${controlsStyles} results-controls`}
      spacing={2}
    >
      {/* Row 1: the checkbox-style selections, on their own full-width row
        above the input controls. */}
      <Grid size={12}>
        <Box
          className='results-controls-selections'
          sx={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            columnGap: 2,
            alignItems: 'center',
            justifyContent: 'flex-end',
            whiteSpace: 'nowrap',
          }}
        >
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
          <FormControlLabel
            control={
              <Checkbox
                checked={expandAll}
                onChange={(e) => onExpandAllChange(e.target.checked)}
                size='small'
              />
            }
            label='Expand all rows'
          />
        </Box>
      </Grid>

      {/* Row 2: the input controls, full-width below the selections. */}
      <Grid size={12}>
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
          <Grid size='auto'>
            <AdvancedColumnsMenu />
          </Grid>
          <Grid size='grow' sx={{ minWidth: 140 }}>
            <DownloadButton resultsPromise={resultsPromise} />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
