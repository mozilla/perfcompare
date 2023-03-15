import Checkbox from '@mui/material/Checkbox';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import { useAppSelector } from '../../hooks/app';
import useCheckRevision from '../../hooks/useCheckRevision';
import type { Revision } from '../../types/state';
import { truncateHash, getLatestCommitMessage } from '../../utils/helpers';

function SearchResultsListItem(props: SearchResultsListItemProps) {
  const { index, item, view } = props;
  const isChecked: boolean = useAppSelector((state) =>
    state.checkedRevisions.revisions.includes(item),
  );
  const { handleToggle } = useCheckRevision();

  const revisionHash = truncateHash(item.revision);
  const commitMessage = getLatestCommitMessage(item);
  const maxRevisions = view == 'compare-results' ? 1 : 4;
  const label = { inputProps: { 'aria-label': `'${commitMessage}' by '${item.author}'` } };

  return (
    <>
      <ListItem
        className="search-revision-item search-revision"
        disablePadding
      >
        <ListItemButton
          key={item.id}
          onClick={() => handleToggle(item, maxRevisions)}
          role="group"
        >
          <ListItemIcon className="search-revision-item-icon search-revision">
            <Checkbox
              className="search-revision-item-checkbox search-revision"
              edge="start"
              tabIndex={-1}
              disableRipple
              data-testid={`checkbox-${index}`}
              checked={isChecked}
              {...label}
            />
          </ListItemIcon>
          <ListItemText
            className="search-revision-item-text search-revision"
            primary={`${revisionHash} - ${commitMessage} `}
            secondary={`${item.author} - ${String(
              new Date(item.push_timestamp * 1000),
            )}`}
            primaryTypographyProps={{ noWrap: true }}
            secondaryTypographyProps={{ noWrap: true }}
          />
        </ListItemButton>
      </ListItem>
    </>
  );
}

interface SearchResultsListItemProps {
  index: number;
  item: Revision;
  view: 'search' | 'compare-results';
}

export default SearchResultsListItem;
