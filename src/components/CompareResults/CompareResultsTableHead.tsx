import React from 'react';

import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton, Popover } from '@mui/material';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import { useAppSelector } from '../../hooks/app';
import { CompareResultsItem } from '../../types/state';
import {
  CompareResultsTableHeader,
  ConfidenceText,
  Platform,
} from '../../types/types';
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
  { id: 'status', 
    label: 'Status',
    key: 'status',
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

interface FilterOptions {
  platform: Set<Platform>;
  test: Set<string>;
  confidence: Set<ConfidenceText>;
}

const filterOptions: FilterOptions = {
  platform: new Set([]),
  test: new Set([]),
  confidence: new Set(['low', 'med', 'high'] as ConfidenceText[]),
};

const filterKeys = Object.keys(filterOptions);

const CompareResultsTableHead = () => {
  const compareResults: CompareResultsItem[] = useAppSelector(
    (state) => state.compareResults.data,
  );

  filterOptions.platform = new Set(
    compareResults.map((result) => result.platform),
  );

  filterOptions.test = new Set([
    ...compareResults.map((result) => result.test),
  ]);

  const [openFilter, setOpenFilter] = React.useState<string | null>(null);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null,
  );

  const open = Boolean(anchorEl);

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

  return (
    <TableHead>
      <TableRow>
        {tableHead.map(
          ({ label, key, align }: CompareResultsTableHeader, index) => {
            let options: string[] | ConfidenceText[] = [];
            let id = '';
            const headerId = key as keyof typeof filterOptions;
            if (filterKeys.includes(headerId)) {
              options = Array.from(filterOptions[headerId].values());
              id = open ? `${key as keyof typeof filterOptions}` : '';
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
                        closeOptions={handleCloseOptions}
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
  );
};

export default CompareResultsTableHead;
