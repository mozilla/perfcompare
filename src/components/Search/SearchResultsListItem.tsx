import { Fragment } from 'react';

import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import Checkbox from '@mui/material/Checkbox';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Radio from '@mui/material/Radio';
import Typography from '@mui/material/Typography';
import { style } from 'typestyle';

import DateTimeDisplay from './DateTimeDisplay';
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
                  component='span'
                  variant='body2'
                  color='textPrimary'
                  className='revision-hash'
                  sx={{
                    alignItems: 'center',
                    display: 'inline',
                  }}
                >
                  {revisionHash}
                </Typography>
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
                    <DateTimeDisplay itemDate={itemDate} />
                  </div>
                </div>
              </Fragment>
            }
            secondary={`${commitMessage} `}
            slotProps={{
              primary: { noWrap: true },
              secondary: { noWrap: true },
            }}
          />
        </ListItem>
      </ListItemButton>
    </>
  );
}

export default SearchResultsListItem;
