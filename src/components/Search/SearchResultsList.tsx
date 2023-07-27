import Box from '@mui/material/Box';
import List from '@mui/material/List';

import { RootState } from '../../common/store';
import { useAppSelector } from '../../hooks/app';
import { SelectListStyles } from '../../styles';
import { InputType, ThemeMode, View } from '../../types/state';
import SearchResultsListItem from './SearchResultsListItem';

interface SearchResultsListProps {
  view: View;
  mode: ThemeMode;
  searchType: InputType;
}

function SearchResultsList(props: SearchResultsListProps) {
  const { view, mode, searchType } = props;
  const searchState = useAppSelector(
    (state: RootState) => state.search[searchType],
  );
  const { searchResults } = searchState;
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
