import Typography from '@mui/material/Typography';


import { Strings } from '../../resources/Strings';
import { SearchContainerStyles } from '../../styles';
import CompareOverTime from './CompareOverTime';
import CompareWithBase from './CompareWithBase';

const strings = Strings.components.searchDefault;

function SearchContainer(props: SearchViewProps) {
  const { themeMode } = props;
  const view = 'search';

  const styles = SearchContainerStyles(themeMode, view);

  return (
    <section className={styles.container}>
      <Typography className='search-default-title'>{strings.title}</Typography>
      <CompareWithBase mode={themeMode} view={view} />
      {/* hidden until post-mvp release */}
      <CompareOverTime mode={themeMode} />
    </section>
  );
}

interface SearchViewProps {
  themeMode: 'light' | 'dark';
}

export default SearchContainer;
