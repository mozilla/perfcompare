import Box from '@mui/material/Box';
import List from '@mui/material/List';

import { useAppSelector } from '../../hooks/app';
import { SelectListStyles } from '../../styles';
import { Changeset } from '../../types/state';
import SearchResultsListItem from './SearchResultsListItem';

interface SearchResultsListProps {
  hasNonEditableState: boolean;
  isBase: boolean;
  searchResults: Changeset[];
  displayedRevisions: Changeset[];
  onToggle: (item: Changeset) => void;
}

function SearchResultsList({
  hasNonEditableState,
  isBase,
  searchResults,
  displayedRevisions,
  onToggle,
}: SearchResultsListProps) {
  const mode = useAppSelector((state) => state.theme.mode);
  const styles = SelectListStyles(mode);
  const revisionsCount = isBase === true ? 1 : 3;
  const isInProgressChecked = (item: Changeset) => {
    return displayedRevisions.map((rev) => rev.id).includes(item.id);
  };

  return (
    <Box
      className={`${styles} results-list-${mode}`}
      id='search-results-list'
      alignItems='flex-end'
      data-testid='list-mode'
    >
      <List dense={hasNonEditableState} sx={{ paddingTop: '0' }}>
        {searchResults.map((item, index) => (
          <SearchResultsListItem
            key={item.id}
            index={index}
            item={item}
            revisionsCount={revisionsCount}
            isChecked={isInProgressChecked(item)}
            onToggle={onToggle}
          />
        ))}
      </List>
    </Box>
  );
}

export default SearchResultsList;
