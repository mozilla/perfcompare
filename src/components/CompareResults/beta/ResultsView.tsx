import { useEffect } from 'react';

import type { Theme } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Container } from '@mui/system';
import { useSearchParams } from 'react-router-dom';

import { useAppDispatch } from '../../../hooks/app';
import { switchToFakeData } from '../../../reducers/CompareResults';
import PerfCompareHeader from '../../Shared/PerfCompareHeader';
import InputsReplacement from './InputsReplacement';
import ResultsMain from './ResultsMain';


function ResultsView(props: ResultsViewProps) {
  const { protocolTheme, toggleColorMode } = props;
  const themeMode = protocolTheme.palette.mode;
  const [searchParams] = useSearchParams();
  const fakeDataParam: string | null = searchParams.get('fakedata');
  const dispatch = useAppDispatch();

// TODO: Populate store with real data or fake data pased on URL params
  useEffect(() => {
    if (fakeDataParam === 'true') {
        dispatch(switchToFakeData());
    }
  }, [fakeDataParam]);
  

  return (
    <Container maxWidth='xl' data-testid='beta-version-compare-results'>
      <PerfCompareHeader
        themeMode={themeMode}
        toggleColorMode={toggleColorMode}
      />
      <Grid container alignItems='center' justifyContent='center'>
        <Grid item xs={10}>
          <InputsReplacement />
        </Grid>
        <Grid item xs={12}>
          <ResultsMain themeMode={themeMode} />
        </Grid>
      </Grid>
    </Container>
  );
}

interface ResultsViewProps {
  protocolTheme: Theme;
  toggleColorMode: () => void;
}

export default ResultsView;
