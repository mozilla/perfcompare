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
import { Spacing } from '../../styles';
import type { RevisionsList } from '../../types/state';
import { InputType } from '../../types/state';
import { truncateHash, getLatestCommitMessage } from '../../utils/helpers';

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
  searchType,
}: SearchResultsListItemProps) {
  const isChecked: boolean = useAppSelector((state) =>
    state.searchCompareWithBase[searchType].checkedRevisions.includes(item),
  );

  const { handleToggle } = useCheckRevision(searchType);
  const revisionHash = truncateHash(item.revision);
  const commitMessage = getLatestCommitMessage(item);
  const revisionsCount = searchType === 'base' ? 1 : 3;
  const itemDate = new Date(item.push_timestamp * 1000);

  return (
    <>
      <ListItemButton
        key={item.id}
        onClick={() => handleToggle(item, revisionsCount)}
        className={`${styles.listItemButton} ${
          isChecked ? 'item-selected' : ''
        }`}
      >
        <ListItem
          className='search-revision-item search-revision'
          disablePadding
        >
          <ListItemIcon className='search-revision-item-icon search-revision'>
            <Checkbox
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
              <React.Fragment>
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
  item: RevisionsList;
  view: 'search' | 'compare-results';
  searchType: InputType;
}

export default SearchResultsListItem;
