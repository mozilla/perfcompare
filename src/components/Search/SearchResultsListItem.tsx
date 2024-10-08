import { Fragment } from 'react';

import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import Checkbox from '@mui/material/Checkbox';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Radio from '@mui/material/Radio';
import Tooltip from '@mui/material/Tooltip'; // Tooltip import
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone'; // Add timezone plugin for dayjs
import utc from 'dayjs/plugin/utc'; // Add UTC plugin for dayjs
import { style } from 'typestyle';

import { Spacing } from '../../styles';
import type { Changeset } from '../../types/state';
import { truncateHash, getLatestCommitMessage } from '../../utils/helpers';

// Enable UTC and timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

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

  const itemDate = dayjs(item.push_timestamp * 1000); // Dayjs date object
  const localTime = itemDate.format('MM/DD/YY HH:mm'); // Format local time
  const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone; // Get local time zone
  const utcTime = itemDate.utc().format('MM/DD/YY HH:mm [UTC]'); // Format as UTC

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

                <div className='info-caption'>
                  <div className='info-caption-item item-author'>
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

                    {/* Tooltip with UTC time */}
                    <Tooltip title={`UTC Time: ${utcTime}`}>
                      <span>
                        {localTime} ({localTimeZone}){' '}
                        {/* Wrap both in a single span */}
                      </span>
                    </Tooltip>
                  </div>
                </div>
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
