import Checkbox from '@mui/material/Checkbox';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useSelector } from 'react-redux';

import type { RootState } from '../../common/store';
import type { Revision } from '../../types/state';
import {
  truncateHash,
  getLatestCommitMessage,
} from '../../utils/searchResultsHelper';

function SearchResultsListItem(props: SearchResultsListItemProps) {
  const { index, item, handleToggle } = props;
  const isChecked: boolean = useSelector((state: RootState) =>
    state.checkedRevisions.revisions.includes(index),
  );
  const indexString = index.toString();

  const revisionHash = truncateHash(item.revision);
  const commitMessage: string = getLatestCommitMessage(item);

  return (
    <ListItemButton
      key={item.id}
      id={indexString}
      onClick={(e) => handleToggle(e)}
    >
      <ListItem className="search-revision-item search-revision" disablePadding>
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
        <ListItemText
          className="search-revision-item-text search-revision"
          primary={`${revisionHash} - ${commitMessage} `}
          secondary={`${item.author} - ${String(
            new Date(item.push_timestamp * 1000),
          )}`}
          sx={{ noWrap: 'true' }}
          primaryTypographyProps={{ noWrap: true }}
          secondaryTypographyProps={{ noWrap: true }}
        />
      </ListItem>
    </ListItemButton>
  );
}

interface SearchResultsListItemProps {
  index: number;
  item: Revision;
  handleToggle: (e: React.MouseEvent) => void;
}

export default SearchResultsListItem;
