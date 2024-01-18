import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SortIcon from '@mui/icons-material/Sort';
import { style } from 'typestyle';

import { Colors, Spacing } from '../../styles';
import type { ThemeMode } from '../../types/state';

function TableHeader(props: TableHeaderProps) {
  const { themeMode } = props;
  const styles = {
    tableHeader: style({
      display: 'grid',
      // Should be kept in sync with the gridTemplateColumns from RevisionRow
      gridTemplateColumns: '2fr 1fr 0.2fr 1fr 1fr 1fr 1fr 1fr 2fr 0.2fr',
      background:
        themeMode == 'light' ? Colors.Background100 : Colors.Background300Dark,
      borderRadius: '4px',
      padding: Spacing.Small,
      $nest: {
        '.cell': {
          borderBottom: 'none',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 0,
          margin: 0,
        },
        '.platform-header, .confidence-header': {
          width: '120px',
        },
        '.status-header': {
          width: '110px',
        },
        '.base-header, .new-header, .delta-header': {
          width: '85px',
        },
        '.confidence-header': {
          width: '140px',
        },
        '.runs-header': {
          textAlign: 'left',
        },
      },
    }),

    filter: style({
      background:
        themeMode == 'light' ? Colors.Background200 : Colors.Background200Dark,
      borderRadius: '4px',
      cursor: 'not-allowed',
    }),

    typography: style({
      fontFamily: 'SF Pro',
      fontStyle: 'normal',
      fontWeight: 590,
      fontSize: '13px',
      lineHeight: '16px',
    }),
  };

  const headerCells = [
    {
      name: 'Platform',
      disable: true,
      filter: true,
      key: 'platform',
      sort: true,
    },
    {
      name: 'Base',
      key: 'base',
    },
    { key: 'comparisonSign' },
    { name: 'New', key: 'new' },
    {
      name: 'Status',
      disable: true,
      filter: true,
      key: 'status',
      sort: true,
    },
    {
      name: 'Delta(%)',
      key: 'delta',
    },
    {
      name: 'Confidence',
      disable: true,
      filter: true,
      key: 'confidence',
      sort: true,
    },
    { name: 'Total Runs', key: 'runs' },
    { key: 'buttons' },
    { key: 'expand' },
  ];
  return (
    <div
      className={`${styles.tableHeader} ${styles.typography}`}
      data-testid='table-header'
    >
      {headerCells.map((header) => (
        <div
          key={`${header.key}`}
          className={`cell ${header.key}-header ${
            header.filter ? styles.filter : ''
          }`}
        >
          {header.sort ? <SortIcon /> : null}
          <div>{header.name}</div>
          {header.filter ? <ExpandMoreIcon /> : null}
        </div>
      ))}
    </div>
  );
}

interface TableHeaderProps {
  themeMode: ThemeMode;
}

export default TableHeader;
