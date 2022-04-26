import React from 'react';

import Checkbox from '@mui/material/Checkbox';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import type { Revision } from '../../types/state';
import { truncateHash, getLastRevision } from '../../utils/searchResultsHelper';

function SearchResultsListItem(props: SearchResultsListItemProps) {
  const { item, handleChildClick } = props;

  return (
    <ListItemButton key={item.id}>
      <ListItem className="search-revision-item search-revision" disablePadding>
        <ListItemIcon className="search-revision-item-icon search-revision">
          <Checkbox
            className="search-revision-item-checkbox search-revision"
            edge="start"
            tabIndex={-1}
            disableRipple
            onClick={handleChildClick}
          />
        </ListItemIcon>
        <ListItemText
          className="search-revision-item-text search-revision"
          primary={`${truncateHash(item)} - ${getLastRevision(item).comments} `}
          secondary={`${item.author} - ${new Date(item.push_timestamp * 1000)}`}
          sx={{ noWrap: 'true' }}
          primaryTypographyProps={{ noWrap: true }}
          secondaryTypographyProps={{ noWrap: true }}
          onClick={handleChildClick}
        />
      </ListItem>
    </ListItemButton>
  );
}

interface SearchResultsListItemProps {
  item: Revision;
  handleChildClick: (e: React.MouseEvent) => void;
}

export default SearchResultsListItem;
