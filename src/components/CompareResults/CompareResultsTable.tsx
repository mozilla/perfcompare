import React from 'react';

import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Alert, Autocomplete, IconButton, Popover, TextField } from '@mui/material';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import { frameworks } from '../../common/constants';
import type { RootState } from '../../common/store';
import { useAppSelector } from '../../hooks/app';
import type { CompareResultsItem } from '../../types/state';
import type {
  Platform,
  CompareResultsTableHeader,
  ConfidenceValue,
  ActiveFilters,
} from '../../types/types';
import CompareResultsTableRow from './CompareResultsTableRow';
import FilterOptionsList from './FilterOptionsList';

const tableHead: CompareResultsTableHeader[] = [
  {
    id: 'platform',
    label: 'Platform',
    key: 'platform',
    align: 'center',
  },
  {
    id: 'graph',
    label: 'Graph',
    key: 'graph',
    align: 'center',
  },
  {
    id: 'test-name',
    label: 'Test Name',
    key: 'test',
    align: 'left',
  },
  {
    id: 'base-value',
    label: 'Base',
    key: 'base',
    align: 'center',
  },
  {
    id: 'new-value',
    label: 'New',
    key: 'new',
    align: 'center',
  },
  {
    id: 'delta-percent',
    label: 'Delta',
    key: 'delta',
    align: 'center',
  },
  {
    id: 'confidence',
    label: 'Confidence',
    key: 'confidence',
    align: 'center',
  },
  {
    id: 'total-runs',
    label: 'Total Runs',
    key: 'run',
    align: 'center',
  },
];

interface Filter {
  platform: {
    options: Set<Platform>;
    active: Platform[] | null;
  };
  test: {
    options: Set<string>;
    active: string[] | null;
  };
  confidence: {
    options: Set<ConfidenceValue>;
    active: ConfidenceValue[] | null;
  };
}

const filter: Filter = {
  platform: {
    options: new Set([]),
    active: null,
  },
  test: {
    options: new Set([]),
    active: null,
  },
  confidence: {
    options: new Set(['Low', 'Medium', 'High'] as ConfidenceValue[]),
    active: null,
  },
};

function CompareResultsTable(props: CompareResultsProps) {
  const { mode } = props;
  const compareResults: CompareResultsItem[] = useAppSelector(
    (state) => state.compareResults,
  );
  const filteredResults: CompareResultsItem[] = useAppSelector(
    (state: RootState) => state.filterCompareResults.filteredResults,
  );

  filter.platform.options = new Set(
    compareResults.map((result) => result.platform),
  );

  const suiteOptions = compareResults.map((result) => result.suite);
  filter.test.options = new Set([
    ...compareResults.map((result) => result.test),
    ...suiteOptions,
  ]);

  const [openFilter, setOpenFilter] = React.useState<string | null>(null);

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null,
  );

  const handleOpenOptions = (
    event: React.MouseEvent<HTMLButtonElement>,
    key: string,
  ) => {
    setOpenFilter(key);
    setAnchorEl(event.currentTarget);
  };

  const handleCloseOptions = () => {
    setAnchorEl(null);
    setOpenFilter(null);
  };

  const open = Boolean(anchorEl);
  const filterKeys = Object.keys(filter);

  const results: CompareResultsItem[] = filteredResults.length
    ? filteredResults
    : compareResults;

  const activeFilters: ActiveFilters = useAppSelector(
    (state) => state.filterCompareResults.activeFilters,
  );
  const { confidence, platform, test } = activeFilters;
  const isFiltered = !!(confidence.length || platform.length || test.length);

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
      {isFiltered && <Alert severity="info">Filters have been applied</Alert>}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              {tableHead.map(
                ({ label, key, align }: CompareResultsTableHeader, index) => {
                  let options: string[] | ConfidenceValue[] = [];
                  let id = '';
                  const headerId = key as keyof typeof filter;
                  if (filterKeys.includes(headerId)) {
                    options = Array.from(filter[headerId].options.values());
                    id = open ? `${key as keyof typeof filter}` : '';
                  }

                  return (
                    <TableCell key={index} align={align}>
                      {label}
                      {filterKeys.includes(headerId) && (
                        <React.Fragment>
                          <IconButton
                            data-testid={`${headerId}-options-button`}
                            onClick={(e) => handleOpenOptions(e, headerId)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                          <Popover
                            id={id}
                            open={openFilter === id}
                            anchorEl={anchorEl}
                            onClose={handleCloseOptions}
                            anchorOrigin={{
                              vertical: 'bottom',
                              horizontal: 'center',
                            }}
                            transformOrigin={{
                              vertical: 'top',
                              horizontal: 'right',
                            }}
                          >
                            <FilterOptionsList
                              options={options}
                              column={headerId}
                            />
                          </Popover>
                        </React.Fragment>
                      )}
                    </TableCell>
                  );
                },
              )}
            </TableRow>
          </TableHead>
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
