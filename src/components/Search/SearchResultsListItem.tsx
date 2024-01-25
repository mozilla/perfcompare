import { Fragment, Dispatch, SetStateAction } from 'react';

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
import { Repository } from '../../types/state';
import { truncateHash, getLatestCommitMessage } from '../../utils/helpers';

interface RevisionsState {
  revs: RevisionsList[];
  repos: Repository['name'][];
}
interface SearchResultsListItemProps {
  index: number;
  item: RevisionsList;
  isEditable: boolean;
  isBase: boolean;
  displayedRevisions: RevisionsState;
  onEditToggle: (toggleArray: RevisionsList[]) => void;
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
  isEditable,
  isBase,
  displayedRevisions,
  onEditToggle,
}: SearchResultsListItemProps) {
  const searchType = isBase ? 'base' : 'new';
  const { handleToggle } = useCheckRevision(isBase, isEditable);

  const isChecked: boolean = useAppSelector((state) =>
    state.search[searchType].checkedRevisions.includes(item),
  );
  const revisionHash = truncateHash(item.revision);
  const commitMessage = getLatestCommitMessage(item);
  const revisionsCount = isBase === true ? 1 : 3;
  const itemDate = new Date(item.push_timestamp * 1000);

  const isInProgressChecked: boolean = displayedRevisions.revs
    .map((rev) => rev.id)
    .includes(item.id);

  const isCheckedState = isEditable ? isInProgressChecked : isChecked;

  const handleToggleAction = () => {
    const toggleArray = handleToggle(
      item,
      revisionsCount,
      displayedRevisions.revs,
    );

    if (isEditable) {
      onEditToggle(toggleArray);
    }
  };

  return (
    <>
      <ListItemButton
        key={item.id}
        onClick={handleToggleAction}
        className={`${styles.listItemButton} ${
          isCheckedState ? 'item-selected' : ''
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
              checked={isCheckedState}
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
