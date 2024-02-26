import Box from '@mui/material/Box';
import List from '@mui/material/List';

import { useAppSelector } from '../../hooks/app';
import useCheckRevision from '../../hooks/useCheckRevision';
import { SelectListStyles } from '../../styles';
import { Changeset } from '../../types/state';
import SearchResultsListItem from './SearchResultsListItem';

interface SearchResultsListProps {
  hasNonEditableState: boolean;
  isBase: boolean;
  searchResults: Changeset[];
  displayedRevisions: Changeset[];
  onEditToggle: (toggleArray: Changeset[]) => void;
}

function SearchResultsList({
  hasNonEditableState,
  isBase,
  searchResults,
  displayedRevisions,
  onEditToggle,
}: SearchResultsListProps) {
  const mode = useAppSelector((state) => state.theme.mode);
  const styles = SelectListStyles(mode);
  const { handleToggle } = useCheckRevision(isBase, hasNonEditableState);
  const searchType = isBase ? 'base' : 'new';
  const revisionsCount = isBase === true ? 1 : 3;
  const isCommittedChecked = (item: Changeset) => {
    return useAppSelector((state) =>
      state.search[searchType].checkedRevisions.includes(item),
    );
  };
  const isInProgressChecked = (item: Changeset) => {
    return displayedRevisions.map((rev) => rev.id).includes(item.id);
  };
  const isCheckedState = hasNonEditableState
    ? isInProgressChecked
    : isCommittedChecked;

  const handleToggleAction = (item: Changeset) => {
    const toggleArray = handleToggle(item, revisionsCount, displayedRevisions);

    if (hasNonEditableState) {
      onEditToggle(toggleArray);
    }
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
            isChecked={isCheckedState(item)}
            onToggle={handleToggleAction}
          />
        ))}
      </List>
    </Box>
  );
}

export default SearchResultsList;
