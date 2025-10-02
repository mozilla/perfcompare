import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import { style } from 'typestyle';

import { DownloadButton } from './DownloadButton';
import RevisionSelect from './RevisionSelect';
import SearchInput from './SearchInput';
import { useAppSelector } from '../../hooks/app';
import { Strings } from '../../resources/Strings';
import type { CompareResultsItem, TestVersionName } from '../../types/state';
import type { Framework } from '../../types/types';
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
  testType: string;
  resultsPromise: Promise<CompareResultsItem[][]>;
  onSearchTermChange: (searchTerm: string) => unknown;
  onFrameworkChange: (frameworkId: Framework['id']) => unknown;
  onTestVersionChange: (testType: string) => void;
}
export default function ResultsControls({
  initialSearchTerm,
  frameworkId,
  testType,
  resultsPromise,
  onSearchTermChange,
  onFrameworkChange,
  onTestVersionChange,
}: Props) {
  const mode = useAppSelector((state) => state.theme.mode);
  return (
    <Grid container className={controlsStyles} spacing={2}>
      <Grid
        size={{
          md: 4,
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
    </Grid>
  );
}
