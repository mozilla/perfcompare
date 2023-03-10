/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as React from 'react';

import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import Checkbox from '@mui/material/Checkbox';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import useCheckRevision from '../../hooks/useCheckRevision';
import type { Revision } from '../../types/state';
import { truncateHash, getLatestCommitMessage } from '../../utils/helpers';

const styles = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  listItemButton: style({
    $nest: {
      '.MuiListItem-root': {
        alignItems: 'flex-start',
      },
      '.search-revision-item-icon': {
        minWidth: '0',
      },
      '.revision-hash': {
        fontWeight: 600,
        marginRight: '8px',
      },

      '.MuiListItemText-primary': {
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
      },
      '.info-caption': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '.75rem',
        flexWrap: 'wrap',
        background: '#F0F0F4',
        borderRadius: '8px',
        padding: '2px 8px',
        $nest: {
          svg: {
            marginRight: '4px',
            fontSize: '1rem',
          },
          '.info-caption-item': {
            display: 'flex',
            alignItems: 'center',
          },
          '.item-author': {
            marginRight: '5px',
          },
        },
      },
    },
  }),
};

function SearchResultsListItem(props: SearchResultsListItemProps) {
  const { index, item, view } = props;
  const isChecked: boolean = useAppSelector((state) =>
    state.checkedRevisions.revisions.includes(item),
  );
  const { handleToggle } = useCheckRevision();

  const revisionHash = truncateHash(item.revision);
  const commitMessage = getLatestCommitMessage(item);
  const maxRevisions = view == 'compare-results' ? 1 : 4;
  const itemDate = new Date(item.push_timestamp * 1000);

  return (
    <>
      <ListItemButton
        key={item.id}
        onClick={() => handleToggle(item, maxRevisions)}
        className={styles.listItemButton}
        sx={{ paddingTop: '0' }}
      >
        <ListItem
          className="search-revision-item search-revision"
          disablePadding
        >
          <ListItemIcon className="search-revision-item-icon search-revision">
            <Checkbox
              className="search-revision-item-checkbox"
              edge="start"
              tabIndex={-1}
              disableRipple
              data-testid={`checkbox-${index}`}
              checked={isChecked}
            />
          </ListItemIcon>
          <ListItemText
            className="search-revision-item-text"
            primary={
              <React.Fragment>
                <Typography
                  sx={{ display: 'inline' }}
                  component="span"
                  variant="body2"
                  color="text.primary"
                  alignItems="center"
                  className="revision-hash"
                >
                  {revisionHash}
                </Typography>

                <div className="info-caption">
                  <div className="info-caption-item item-author">
                    {' '}
                    <MailOutlineOutlinedIcon
                      className="mail-icon"
                      fontSize="small"
                    />{' '}
                    {item.author}
                  </div>

                  <div className="info-caption-item item-time">
                    <AccessTimeOutlinedIcon
                      className="time-icon"
                      fontSize="small"
                    />
                    {String(dayjs(itemDate).format('MM/DD/YY HH:mm'))}
                  </div>
                </div>
              </React.Fragment>
            }
            secondary={`${commitMessage} `}
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
