import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import { style } from 'typestyle';

import AdvancedOptionsMenu from './AdvancedOptionsMenu';
import { DownloadButton } from './DownloadButton';
import RevisionSelect from './RevisionSelect';
import SearchInput from './SearchInput';
import { useAppDispatch, useAppSelector } from '../../hooks/app';
import { updateShowHowToRead } from '../../reducers/ColumnPrefsSlice';
import { Strings } from '../../resources/Strings';
import type { CombinedResultsItemType } from '../../types/state';
import type { Framework, TestVersion } from '../../types/types';
import FrameworkMultiSelect from '../Shared/FrameworkMultiSelect';
import TestVersionDropdown from '../Shared/TestVersionDropdown';

const controlsStyles = style({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
});

interface Props {
  initialSearchTerm: string;
  frameworkSelection: Framework['id'][];
  testType?: TestVersion;
  resultsPromise: Promise<CombinedResultsItemType[][]>;
  expandAll: boolean;
  onSearchTermChange: (searchTerm: string) => unknown;
  onFrameworkChange: (selection: Framework['id'][]) => unknown;
  onTestVersionChange: (testType: TestVersion) => void;
  onExpandAllChange: (checked: boolean) => void;
}
export default function ResultsControls({
  initialSearchTerm,
  frameworkSelection,
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
  };

  // Framework changes are staged locally and committed when the menu closes,
  // so selecting several frameworks results in a single results reload.
  const [draftFrameworkSelection, setDraftFrameworkSelection] =
    useState(frameworkSelection);

  // Keep the draft in sync when the selection changes outside the toolbar
  // (e.g. browser back/forward navigation).
  useEffect(() => {
    setDraftFrameworkSelection(frameworkSelection);
  }, [frameworkSelection]);

  const onFrameworkMenuClose = () => {
    const changed =
      draftFrameworkSelection.length !== frameworkSelection.length ||
      draftFrameworkSelection.some((id) => !frameworkSelection.includes(id));
    if (changed) {
      onFrameworkChange(draftFrameworkSelection);
    }
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
              <FrameworkMultiSelect
                selection={draftFrameworkSelection}
                onChange={setDraftFrameworkSelection}
                onMenuClose={onFrameworkMenuClose}
                size='small'
                variant='outlined'
                mode={mode}
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
            <AdvancedOptionsMenu />
          </Grid>
          <Grid size='grow' sx={{ minWidth: 140 }}>
            <DownloadButton resultsPromise={resultsPromise} />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
