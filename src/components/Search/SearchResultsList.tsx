import Box from '@mui/material/Box';
import List from '@mui/material/List';

import { SelectListStyles } from '../../styles';
import { InputType, ThemeMode, View, RevisionsList } from '../../types/state';
import SearchResultsListItem from './SearchResultsListItem';

interface SearchResultsListProps {
  view: View;
  mode: ThemeMode;
  searchType: InputType;
  searchResults: RevisionsList[];
}

function SearchResultsList(props: SearchResultsListProps) {
  const { view, mode, searchType, searchResults } = props;
  const styles = SelectListStyles(mode);

  return (
    <Box
      className={`${styles} results-list-${mode}`}
      id='search-results-list'
      alignItems='flex-end'
      data-testid='list-mode'
    >
      <List dense={view == 'compare-results'} sx={{ paddingTop: '0' }}>
        {searchResults.map((item, index) => (
          <SearchResultsListItem
            key={item.id}
            index={index}
            item={item}
            view={view}
            searchType={searchType}
          />
        ))}
      </List>
    </Box>
  );
}

export default SearchResultsList;
