import * as React from 'react';

import { CloseOutlined } from '@mui/icons-material';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import WarningIcon from '@mui/icons-material/Warning';
import Button from '@mui/material/Button';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';

import useCheckRevision from '../../hooks/useCheckRevision';
import { Strings } from '../../resources/Strings';
import { SelectRevsStyles } from '../../styles';
import type { RevisionsList } from '../../types/state';
import { InputType } from '../../types/state';
import { truncateHash, getLatestCommitMessage } from '../../utils/helpers';

const warning =
  Strings.components.searchDefault.base.collapsed.warnings.comparison;

interface SelectedRevisionItemProps {
  index: number;
  item: RevisionsList;
  mode: 'light' | 'dark';
  repository: string | undefined;
  searchType: InputType;
  isWarning?: boolean;
}

function SelectedRevisionItem({
  index,
  item,
  mode,
  repository,
  searchType,
  isWarning,
}: SelectedRevisionItemProps) {
  const styles = SelectRevsStyles(mode);
  const revisionHash = truncateHash(item.revision);
  const commitMessage = getLatestCommitMessage(item);
  const itemDate = new Date(item.push_timestamp * 1000);
  const { handleRemoveRevision } = useCheckRevision(searchType);

  return (
    <div className='item-container' data-testid='selected-rev-item'>
      <div className={styles.repo}>
        <div>{repository || 'unknown'}</div>
        {isWarning && repository === 'try' && (
          <div className='warning-icon'>
            <Tooltip placement='top' title={warning}>
              <WarningIcon fontSize='small' color='warning' />
            </Tooltip>
          </div>
        )}
      </div>

      <ListItemButton className={styles.listItemButton} key={index}>
        <ListItem>
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
          <ListItemIcon className='search-revision-item-icon search-revision'>
            <Button
              role='button'
              name='close-button'
              aria-label='close-button'
              onClick={() => handleRemoveRevision(item)}
            >
              <CloseOutlined className='close-icon' fontSize='small' />
            </Button>
          </ListItemIcon>
        </ListItem>
      </ListItemButton>
    </div>
  );
}

export default SelectedRevisionItem;
