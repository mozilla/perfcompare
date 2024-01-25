import Box from '@mui/material/Box';
import List from '@mui/material/List';

import { SelectListStyles } from '../../styles';
import { RevisionsList, ThemeMode, Repository } from '../../types/state';
import SearchResultsListItem from './SearchResultsListItem';

interface RevisionsState {
  revs: RevisionsList[];
  repos: Repository['name'][];
}
interface SearchResultsListProps {
  isEditable: boolean;
  isBase: boolean;
  mode: ThemeMode;
  searchResults: RevisionsList[];
  displayedRevisions: RevisionsState;
  onEditToggle: (toggleArray: RevisionsList[]) => void;
}
function SearchResultsList({
  isEditable,
  isBase,
  mode,
  searchResults,
  displayedRevisions,
  onEditToggle,
}: SearchResultsListProps) {
  const styles = SelectListStyles(mode);

  return (
    <Box
      className={`${styles} results-list-${mode}`}
      id='search-results-list'
      alignItems='flex-end'
      data-testid='list-mode'
    >
      <List dense={isEditable == true} sx={{ paddingTop: '0' }}>
        {searchResults.map((item, index) => (
          <SearchResultsListItem
            key={item.id}
            index={index}
            item={item}
            isEditable={isEditable}
            isBase={isBase}
            displayedRevisions={displayedRevisions}
            onEditToggle={onEditToggle}
          />
        ))}
      </List>
    </Box>
  );
}

export default SearchResultsList;
