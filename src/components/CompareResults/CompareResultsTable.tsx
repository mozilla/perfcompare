import React from 'react';

import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  Autocomplete,
  IconButton,
  Popover,
  TextField,
} from '@mui/material';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useSelector } from 'react-redux';

import { frameworks } from '../../common/constants';
import type { RootState } from '../../common/store';
import type { CompareResultsItem } from '../../types/state';
import type { Platform, Header, ConfidenceValue } from '../../types/types';
import CompareResultsTableRow from './CompareResultsTableRow';
import FilterOptionsList from './FilterOptionsList';

const tableHeaders: Header[] = [
  {
    title: 'Platform',
    key: 'platform',
  },
  {
    title: 'Graph',
    key: 'graph',
  },
  {
    title: 'Suite',
    key: 'suite',
  },
  {
    title: 'Test Name',
    key: 'test',
  },
  {
    title: 'Base',
    key: 'base',
  },
  {
    title: 'New',
    key: 'new',
  },
  {
    title: 'Delta',
    key: 'delta',
  },
  {
    title: 'Confidence',
    key: 'confidence',
  },
  {
    title: 'Total Runs',
    key: 'run',
  },
];

interface Filter {
  platform: {
    options: Set<Platform>;
    active: Platform[] | null;
  };
  suite: {
    options: Set<string>;
    active: string[] | null;
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
  suite: {
    options: new Set([]),
    active: null,
  },
  test: {
    options: new Set([]),
    active: null,
  },
  confidence: {
    options: new Set([
      'Low',
      'Medium',
      'High',
    ] as ConfidenceValue[]),
    active: null,
  },
};

function CompareResultsTable(props: CompareResultsProps) {
  const { mode } = props;
  const filteredResults = useSelector((state: RootState) => state.filterCompareResults.filteredResults);
  const compareResults: CompareResultsItem[] = useSelector(
    (state: RootState) => state.compareResults,
  );

  filter.platform.options = new Set(
    compareResults.map((result) => result.platform),
  );
  filter.suite.options = new Set(compareResults.map((result) => result.suite));
  filter.test.options = new Set(compareResults.map((result) => result.test));

  const [openFilter, setOpenFilter] = React.useState<string | null>(null);

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null, 
  );

  const handleOpenOptions = (event: React.MouseEvent<HTMLButtonElement>, key: string) => {
      setOpenFilter(key);
      setAnchorEl(event.currentTarget);
  };

  const handleCloseOptions = () => {
    setAnchorEl(null);
    setOpenFilter(null);
  };

  const open = Boolean(anchorEl);

  const results = filteredResults.length ? filteredResults : compareResults;
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
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              {tableHeaders.map(({ title, key }, index) => {
                let options: string[] = [];
                let id = '';
                if (Object.keys(filter).includes(key)) {
                  options = Array.from(
                    filter[key as keyof typeof filter].options.values(),
                  );
                  id = open ? `${key as keyof typeof filter}` : '';
                }              

                return (
                  <TableCell key={index}>
                    {title}
                    {Object.keys(filter).includes(key) && (
                      <React.Fragment>
                        <IconButton onClick={(e) => handleOpenOptions(e, key)}>
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
                          <FilterOptionsList options={options} column={key} />
                        </Popover>
                      </React.Fragment>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {results.length > 0 &&
              results.map((result, index) => (
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
