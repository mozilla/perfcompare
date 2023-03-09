import React from 'react';

import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  ClickAwayListener,
  Fade,
  IconButton,
  Paper,
  Popper,
  PopperPlacementType,
} from '@mui/material';
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
  { id: 'status', label: 'Status', key: 'status', align: 'center' },
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

interface ActivePopper {
  options: string[] | null;
  headerId: string | null;
}

const filterOptions: FilterOptions = {
  platform: new Set([]),
  test: new Set([]),
  confidence: new Set([
    'low',
    'med',
    'high',
    'not available',
  ] as ConfidenceText[]),
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

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null,
  );

  const [openPopper, setOpenPopper] = React.useState(false);
  const [placement, setPlacement] = React.useState<PopperPlacementType>();
  const [activePopper, setActivePopper] = React.useState<ActivePopper>();

  const handleCloseOptions = () => {
    setAnchorEl(null);
    setOpenPopper(false);
  };

  const handleClickPopper =
    (newPlacement: PopperPlacementType, headerId: string, options: string[]) =>
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      if (anchorEl === null || event.currentTarget === anchorEl) {
        setOpenPopper((prev) => !prev);
        setAnchorEl(event.currentTarget);
      }
      if (event.currentTarget !== anchorEl) {
        setOpenPopper(true);
        setPlacement(newPlacement);
        setAnchorEl(event.currentTarget);
      }
      setActivePopper({ options, headerId });
    };

  const handleOnClickAway = () => {
    if (openPopper) {
      setAnchorEl(null);
      setOpenPopper(false);
    }
  };

  return (
    <TableHead>
      <TableRow>
        <ClickAwayListener onClickAway={handleOnClickAway}>
          <Popper
            open={openPopper}
            anchorEl={anchorEl}
            placement={placement}
            transition
          >
            {({ TransitionProps }) => (
              <Fade {...TransitionProps}>
                <Paper>
                  <FilterOptionsList
                    options={activePopper?.options as string[]}
                    column={activePopper?.headerId as string}
                    closeOptions={handleCloseOptions}
                  />
                </Paper>
              </Fade>
            )}
          </Popper>
        </ClickAwayListener>
        {tableHead.map(
          ({ label, key, align }: CompareResultsTableHeader, index) => {
            let options: string[] | ConfidenceText[] = [];
            const headerId = key as keyof typeof filterOptions;
            if (filterKeys.includes(headerId)) {
              options = Array.from(filterOptions[headerId].values());
            }
            return (
              <TableCell key={index} align={align}>
                {label}
                {filterKeys.includes(headerId) && (
                  <React.Fragment>
                    <IconButton
                      data-testid={`${headerId}-options-button`}
                      onClick={handleClickPopper(
                        'bottom-end',
                        headerId,
                        options,
                      )}
                    >
                      <MoreVertIcon />
                    </IconButton>
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
