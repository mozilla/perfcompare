import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import { style } from 'typestyle';

import { DownloadButton } from './DownloadButton';
import RevisionSelect from './RevisionSelect';
import SearchInput from './SearchInput';
import { useAppSelector } from '../../hooks/app';
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
  return (
    <Grid container className={controlsStyles} spacing={2}>
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
      <Grid size='grow'>
        <RevisionSelect />
      </Grid>
      <Grid size='grow'>
        <DownloadButton resultsPromise={resultsPromise} />
      </Grid>
      <Grid size='auto'>
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
      </Grid>
    </Grid>
  );
}
