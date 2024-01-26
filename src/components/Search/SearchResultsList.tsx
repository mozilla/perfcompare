import Box from '@mui/material/Box';
import List from '@mui/material/List';

import { SelectListStyles } from '../../styles';
import { InputType, Repository, RevisionsList, View } from '../../types/state';
import SearchResultsListItem from './SearchResultsListItem';
import { useAppSelector } from '../../hooks/app';
import useCheckRevision from '../../hooks/useCheckRevision';

interface RevisionsState {
  revs: RevisionsList[];
  repos: Repository['name'][];
}
interface SearchResultsListProps {
  isEditable: boolean;
  isBase: boolean;
  searchResults: RevisionsList[];
  displayedRevisions: RevisionsState;
  onEditToggle: (toggleArray: RevisionsList[]) => void;
}
function SearchResultsList({
  isEditable,
  isBase,
  searchResults,
  displayedRevisions,
  onEditToggle,
}: SearchResultsListProps) {
  const mode = useAppSelector((state) => state.theme.mode);
  const styles = SelectListStyles(mode);
  const { handleToggle } = useCheckRevision(isBase, isEditable);
  const searchType = isBase ? 'base' : 'new';
  const revisionsCount = isBase === true ? 1 : 3;
  const isCommittedChecked = (item: RevisionsList) => {
    return useAppSelector((state) =>
      state.search[searchType].checkedRevisions.includes(item),
    );
  };
  const isInProgressChecked = (item: RevisionsList) => {
    return displayedRevisions.revs.map((rev) => rev.id).includes(item.id);
  };
  const isCheckedState = isEditable ? isInProgressChecked : isCommittedChecked;

  const handleToggleAction = (item: RevisionsList) => {
    const toggleArray = handleToggle(
      item,
      revisionsCount,
      displayedRevisions.revs,
    );

    if (isEditable) {
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
      <List dense={isEditable == true} sx={{ paddingTop: '0' }}>
        {searchResults.map((item, index) => (
          <SearchResultsListItem
            key={item.id}
            index={index}
            item={item}
            revisionsCount={revisionsCount}
            isCheckedState={isCheckedState}
            onToggle={handleToggleAction}
          />
        ))}
      </List>
    </Box>
  );
}

export default SearchResultsList;
