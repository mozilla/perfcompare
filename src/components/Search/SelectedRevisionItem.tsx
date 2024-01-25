import React from 'react';

import { CloseOutlined } from '@mui/icons-material';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import WarningIcon from '@mui/icons-material/Warning';
import { Link } from '@mui/material';
import Button from '@mui/material/Button';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';

import useCheckRevision from '../../hooks/useCheckRevision';
import { Strings } from '../../resources/Strings';
import { SelectRevsStyles } from '../../styles';
import type { RevisionsList, ThemeMode } from '../../types/state';
import { Repository } from '../../types/state';
import {
  truncateHash,
  getLatestCommitMessage,
  getTreeherderURL,
} from '../../utils/helpers';

const base = Strings.components.searchDefault.base;
const warning = base.collapsed.warnings.comparison;

interface SelectedRevisionItemProps {
  index: number;
  item: RevisionsList;
  repository: Repository['name'];
  formIsDisplayed: boolean;
  isEditable: boolean;
  isBase: boolean;
  mode: ThemeMode;
  isWarning: boolean;
  onEditRemove: (isBase: boolean, item: RevisionsList) => void;
}

function SelectedRevisionItem({
  index,
  item,
  repository,
  formIsDisplayed,
  isEditable,
  isBase,
  mode,
  isWarning,
  onEditRemove,
}: SelectedRevisionItemProps) {
  const searchType = isBase ? 'base' : 'new';
  const styles = SelectRevsStyles(mode);
  const revisionHash = truncateHash(item.revision);
  const commitMessage = getLatestCommitMessage(item);
  const itemDate = new Date(item.push_timestamp * 1000);
  const { removeCheckedRevision } = useCheckRevision(isBase, isEditable);

  const iconClassName =
    !formIsDisplayed && isEditable
      ? 'icon icon-close-hidden'
      : 'icon icon-close-show';

  const handleRemoveRevision = () => {
    removeCheckedRevision(item);
  };

  const handleRemoveEditViewRevision = () => {
    onEditRemove(isBase, item);
  };

  return (
    <ListItem
      className={`item-container item-${index} item-${searchType}`}
      data-testid='selected-rev-item'
    >
      <div className={styles.repo}>
        <div>{repository}</div>
        {isWarning && repository === 'try' && (
          <div className='warning-icon'>
            <Tooltip placement='top' title={warning}>
              <WarningIcon
                fontSize='small'
                color='warning'
                titleAccess={warning}
              />
            </Tooltip>
          </div>
        )}
      </div>
      <ListItemButton className={styles.listItemButton}>
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
                <Link
                  href={getTreeherderURL(item.revision, repository)}
                  target='_blank'
                >
                  {revisionHash}
                </Link>
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
        <Button
          role='button'
          name='close-button'
          aria-label='close-button'
          className={`${iconClassName} revision-action close-button`}
          onClick={
            isEditable ? handleRemoveEditViewRevision : handleRemoveRevision
          }
        >
          <CloseOutlined fontSize='small' data-testid='close-icon' />
        </Button>
      </ListItemButton>
    </ListItem>
  );
}

export default SelectedRevisionItem;
