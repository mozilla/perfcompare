import Checkbox from '@mui/material/Checkbox';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import type { Revision } from '../../types/state';
import { truncateHash, getLastRevision } from '../../utils/searchResultsHelper';

function SearchResultsListItem(props: SearchResultsListItemProps) {
  const { checked, item, handleToggle } = props;

  return (
    <ListItemButton
      key={item.id}
      id={item.revision}
      onClick={(e) => handleToggle(e)}
    >
      <ListItem className="search-revision-item search-revision" disablePadding>
        <ListItemIcon className="search-revision-item-icon search-revision">
          <Checkbox
            className="search-revision-item-checkbox search-revision"
            edge="start"
            tabIndex={-1}
            disableRipple
            data-testid={`checkbox-${item.id}`}
            checked={checked.indexOf(item.revision) !== -1}
          />
        </ListItemIcon>
        <ListItemText
          className="search-revision-item-text search-revision"
          primary={`${truncateHash(item)} - ${getLastRevision(item).comments} `}
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
  checked: string[];
  item: Revision;
  handleToggle: (e: React.MouseEvent) => void;
}

export default SearchResultsListItem;
