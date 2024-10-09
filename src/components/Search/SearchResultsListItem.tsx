import { Fragment } from 'react';

import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import { Tooltip } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Radio from '@mui/material/Radio';
import Typography from '@mui/material/Typography';
import { style } from 'typestyle';

import { Spacing } from '../../styles';
import type { Changeset } from '../../types/state';
import { truncateHash, getLatestCommitMessage } from '../../utils/helpers';

interface SearchResultsListItemProps {
  index: number;
  item: Changeset;
  isChecked: boolean;
  onToggle: (item: Changeset) => void;
  listItemComponent?: 'checkbox' | 'radio';
}

const styles = {
  listItemButton: style({
    paddingTop: 0,
    $nest: {
      '.MuiListItem-root': {
        alignItems: 'flex-start',
      },
      '.search-revision-item-icon': {
        minWidth: '0',
      },

      '.MuiListItemText-primary': {
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
      },
      '.info-caption': {
        flexWrap: 'wrap',
        $nest: {
          svg: {
            marginRight: `${Spacing.xSmall}px`,
            fontSize: '1rem',
          },
          '.item-author': {
            marginRight: `${Spacing.xSmall + 1}px`,
          },
        },
      },
    },
  }),
};

function SearchResultsListItem({
  index,
  item,
  isChecked,
  onToggle,
  listItemComponent,
}: SearchResultsListItemProps) {
  const ListItemComponent = listItemComponent === 'radio' ? Radio : Checkbox;
  const revisionHash = truncateHash(item.revision);
  const commitMessage = getLatestCommitMessage(item);
  const itemDate = new Date(item.push_timestamp * 1000);

  const localDateTime = itemDate
    .toLocaleString(undefined, {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZoneName: 'short',
    })
    .replace(',', '') // Removes the comma between the date and time
    .replace(/(\d{2})\/(\d{2})\/(\d{2})/, '$2/$1/$3'); // Reformat date as MM/DD/YY

  const utcDateTime = itemDate
    .toLocaleString('en-US', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC',
      timeZoneName: 'short',
    })
    .replace(',', '')
    .replace(/(\d{2})\/(\d{2})\/(\d{2})/, '$1/$2/$3');

  const onToggleAction = () => {
    onToggle(item);
  };

  return (
    <>
      <ListItemButton
        key={item.id}
        onClick={onToggleAction}
        className={`${styles.listItemButton} ${
          isChecked ? 'item-selected' : ''
        }`}
      >
        <ListItem
          className='search-revision-item search-revision'
          disablePadding
        >
          <ListItemIcon className='search-revision-item-icon search-revision'>
            <ListItemComponent
              className='search-revision-item-checkbox'
              edge='start'
              tabIndex={-1}
              disableRipple
              data-testid={`checkbox-${index}`}
              checked={isChecked}
            />
          </ListItemIcon>
          <ListItemText
            className='search-revision-item-text'
            primary={
              <Fragment>
                <Typography
                  sx={{ display: 'inline' }}
                  component='span'
                  variant='body2'
                  color='text.primary'
                  alignItems='center'
                  className='revision-hash'
                >
                  {revisionHash}
                </Typography>

                <Tooltip title={utcDateTime} placement='top'>
                  <div className='info-caption'>
                    <div className='info-caption-item item-author'>
                      {' '}
                      <MailOutlineOutlinedIcon
                        className='mail-icon'
                        fontSize='small'
                      />{' '}
                      {item.author}
                    </div>

                    <div className='info-caption-item item-time'>
                      <AccessTimeOutlinedIcon
                        className='time-icon'
                        fontSize='small'
                      />
                      {localDateTime}
                    </div>
                  </div>
                </Tooltip>
              </Fragment>
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

export default SearchResultsListItem;
