import React from 'react';

import { Autocomplete, TextField } from '@mui/material';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';

import { frameworks } from '../../common/constants';
import type { RootState } from '../../common/store';
import { useAppSelector } from '../../hooks/app';
import type { CompareResultsItem } from '../../types/state';
import CompareResultsTableHead from './CompareResultsTableHead';
import CompareResultsTableRow from './CompareResultsTableRow';
import CompareTableStatus from './CompareTableStatus';

function CompareResultsTable(props: CompareResultsProps) {
  const { mode } = props;
  const compareResults: CompareResultsItem[] = useAppSelector(
    (state) => state.compareResults,
  );
  const filteredResults: CompareResultsItem[] = useAppSelector(
    (state: RootState) => state.filterCompareResults.filteredResults,
  );

  const results: CompareResultsItem[] = filteredResults.length
    ? filteredResults
    : compareResults;

  return (
    <React.Fragment>
      <Autocomplete
        id="size-small-standard"
        size="small"
        sx={{ width: 200, marginBottom: 5 }}
        options={frameworks}
        isOptionEqualToValue={(option, value) => option.name === value.name}
        getOptionLabel={(option) => option.name}
        defaultValue={frameworks[0]}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="standard"
            label="Framework"
            placeholder="Select framework"
          />
        )}
      />
      <CompareTableStatus />
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
          <CompareResultsTableHead />
          <TableBody>
            {results.length > 0 &&
              results.map((result: CompareResultsItem, index) => (
                <CompareResultsTableRow
                  key={index}
                  result={result}
                  index={index}
                  mode={mode}
                />
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </React.Fragment>
  );
}

interface CompareResultsProps {
  mode: 'light' | 'dark';
}

export default CompareResultsTable;
