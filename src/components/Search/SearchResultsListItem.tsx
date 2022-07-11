import Checkbox from '@mui/material/Checkbox';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useSelector } from 'react-redux';

import type { RootState } from '../../common/store';
import useCheckRevision from '../../hooks/useCheckRevision';
import type { Revision } from '../../types/state';
import { truncateHash, getLatestCommitMessage } from '../../utils/helpers';

function SearchResultsListItem(props: SearchResultsListItemProps) {
  const { index, item, view } = props;
  const isChecked: boolean = useSelector((state: RootState) =>
    state.checkedRevisions.revisions.includes(index),
  );
  const { handleToggle } = useCheckRevision();

  const indexString = index.toString();

  const revisionHash = truncateHash(item.revision);
  const commitMessage = getLatestCommitMessage(item);

  return (
    <>
      <ListItemButton
        key={item.id}
        id={indexString}
        // TODO: add onClick functionality for Results View
        onClick={(e) => handleToggle(e)}
      >
        <ListItem
          className="search-revision-item search-revision"
          disablePadding
        >
          {view == 'search' && (
            <ListItemIcon className="search-revision-item-icon search-revision">
              <Checkbox
                className="search-revision-item-checkbox search-revision"
                edge="start"
                tabIndex={-1}
                disableRipple
                data-testid={`checkbox-${indexString}`}
                checked={isChecked}
              />
            </ListItemIcon>
          )}
          <ListItemText
            className="search-revision-item-text search-revision"
            primary={`${revisionHash} - ${commitMessage} `}
            secondary={`${item.author} - ${String(
              new Date(item.push_timestamp * 1000),
            )}`}
            primaryTypographyProps={{ noWrap: true }}
            secondaryTypographyProps={{ noWrap: true }}
          />
        </ListItem>
      </ListItemButton>
    </>
  );
}

interface SearchResultsListItemProps {
  index: number;
  item: Revision;
  view: 'search' | 'compare-results';
}

export default SearchResultsListItem;
