import React from 'react';

import Checkbox from '@mui/material/Checkbox';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import PropTypes from 'prop-types';

import { truncateHash, getLastRevision } from '../../utils/searchResultsHelper';

function SearchResultsListItem(props) {
  const { item } = props;
  return (
    <ListItemButton key={item.id}>
      <ListItem className="search-revision-item search-revision" disablePadding>
        <ListItemIcon className="search-revision-item-icon search-revision">
          <Checkbox
            className="search-revision-item-checkbox search-revision"
            edge="start"
            tabIndex={-1}
            disableRipple
          />
        </ListItemIcon>
        <ListItemText
          className="search-revision-item-text search-revision"
          primary={`${truncateHash(item)} - ${getLastRevision(item).comments} `}
          secondary={`${item.author} - ${new Date(item.push_timestamp * 1000)}`}
          sx={{ noWrap: 'true' }}
          primaryTypographyProps={{ noWrap: true }}
          secondaryTypographyProps={{ noWrap: true }}
        />
      </ListItem>
    </ListItemButton>
  );
}

SearchResultsListItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    revision: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    revisions: PropTypes.arrayOf(
      PropTypes.shape({
        result_set_id: PropTypes.number,
        repository_id: PropTypes.number,
        revision: PropTypes.string,
        author: PropTypes.string,
        comments: PropTypes.string.isRequired,
      }).isRequired,
    ),
    revision_count: PropTypes.number,
    push_timestamp: PropTypes.number.isRequired,
    repository_id: PropTypes.number.isRequired,
  }).isRequired,
};

export default SearchResultsListItem;
