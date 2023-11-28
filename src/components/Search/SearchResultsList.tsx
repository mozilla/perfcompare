import Box from '@mui/material/Box';
import List from '@mui/material/List';

import { useAppSelector } from '../../hooks/app';
import { SelectListStyles } from '../../styles';
import { InputType, View } from '../../types/state';
import SearchResultsListItem from './SearchResultsListItem';
interface SearchResultsListProps {
  view: View;
  searchType: InputType;
  isEditable: boolean;
}

function SearchResultsList(props: SearchResultsListProps) {
  const { view, searchType } = props;
  const mode = useAppSelector((state) => state.theme.mode);
  const searchState = useAppSelector((state) => state.search[searchType]);
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
            isEditable={isEditable}
          />
        ))}
      </List>
    </Box>
  );
}

export default SearchResultsList;
