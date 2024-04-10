import Box from '@mui/material/Box';
import List from '@mui/material/List';

import { useAppSelector } from '../../hooks/app';
import { SelectListStyles } from '../../styles';
import { Changeset } from '../../types/state';
import SearchResultsListItem from './SearchResultsListItem';

interface SearchResultsListProps {
  compact: boolean;
  searchResults: Changeset[];
  displayedRevisions: Changeset[];
  onToggle: (item: Changeset) => void;
}

function SearchResultsList({
  compact,
  searchResults,
  displayedRevisions,
  onToggle,
}: SearchResultsListProps) {
  const mode = useAppSelector((state) => state.theme.mode);
  const styles = SelectListStyles(mode);
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
      <List dense={compact} sx={{ paddingTop: '0' }}>
        {searchResults.map((item, index) => (
          <SearchResultsListItem
            key={item.id}
            index={index}
            item={item}
            isChecked={isInProgressChecked(item)}
            onToggle={onToggle}
          />
        ))}
      </List>
    </Box>
  );
}

export default SearchResultsList;
