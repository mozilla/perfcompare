import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SortIcon from '@mui/icons-material/Sort';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import { Colors, Spacing } from '../../styles';
import type { CompareResultsTableConfig } from '../../types/types';

type TableHeaderProps = {
  headerCellsConfiguration: CompareResultsTableConfig[];
};

function TableHeader({ headerCellsConfiguration }: TableHeaderProps) {
  const themeMode = useAppSelector((state) => state.theme.mode);
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

  return (
    <div
      className={`${styles.tableHeader} ${styles.typography}`}
      data-testid='table-header'
      role='row'
    >
      {headerCellsConfiguration.map((header) => (
        <div
          key={`${header.key}`}
          className={`cell ${header.key}-header ${
            header.filter ? styles.filter : ''
          }`}
          role='columnheader'
        >
          {header.sort ? <SortIcon /> : null}
          <div role='cell'>{header.name}</div>
          {header.filter ? <ExpandMoreIcon /> : null}
        </div>
      ))}
    </div>
  );
}

export default TableHeader;
