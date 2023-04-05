import type { Theme } from '@mui/material';

import PerfCompareHeader from '../../Shared/beta/PerfCompareHeader';

function SearchViewBeta(props: SearchViewProps) {
  const { toggleColorMode, protocolTheme } = props;
  const themeMode = protocolTheme.palette.mode;

  return (
    <section className='perfcompare-body'>
      <PerfCompareHeader
        themeMode={themeMode}
        toggleColorMode={toggleColorMode}
      />
      <div>Search View Beta Content</div>
    </section>
  );
}

interface SearchViewProps {
  toggleColorMode: () => void;
  protocolTheme: Theme;
}

export default SearchViewBeta;
