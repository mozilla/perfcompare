import React from 'react';

import { CloseOutlined } from '@mui/icons-material';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import WarningIcon from '@mui/icons-material/Warning';
import { Box, Link } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import DateTimeDisplay from './DateTimeDisplay';
import { repoMap } from '../../common/constants';
import { useAppSelector } from '../../hooks/app';
import { Strings } from '../../resources/Strings';
import { SelectRevsStyles } from '../../styles';
import { Changeset } from '../../types/state';
import {
  truncateHash,
  getLatestCommitMessage,
  getTreeherderURL,
} from '../../utils/helpers';
import CopyIcon from '../Shared/CopyIcon';

const base = Strings.components.searchDefault.base;
const warning = base.collapsed.warnings.comparison;

interface SelectedRevisionItemProps {
  index: number;
  item: Changeset;
  isBase: boolean;
  isWarning: boolean;
  iconClassName: string;
  onRemoveRevision: (item: Changeset) => void;
}

function SelectedRevisionItem({
  index,
  item,
  iconClassName,
  isBase,
  isWarning,
  onRemoveRevision,
}: SelectedRevisionItemProps) {
  const searchType = isBase ? 'base' : 'new';
  const mode = useAppSelector((state) => state.theme.mode);
  const styles = SelectRevsStyles(mode);
  const revisionHash = truncateHash(item.revision);
  const commitMessage = getLatestCommitMessage(item);
  const itemDate = new Date(item.push_timestamp * 1000);
  const repository = repoMap[item.repository_id] ?? 'try';

  return (
    <ListItem
      className={`item-container item-${index} item-${searchType}`}
      data-testid='selected-rev-item'
    >
      <input type='hidden' name={searchType + 'Rev'} value={item.revision} />
      <input type='hidden' name={searchType + 'Repo'} value={repository} />
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
      <Box className={styles.selectedRevision}>
        <ListItemText
          className='search-revision-item-text'
          primary={
            <React.Fragment>
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
                <Link
                  href={getTreeherderURL(item.revision, repository)}
                  target='_blank'
                  title={`${Strings.components.revisionRow.title.jobLink} ${revisionHash}`}
                >
                  {revisionHash}
                </Link>
                <CopyIcon
                  text={revisionHash}
                  arialLabel='Copy the revision to the clipboard'
                />
              </Typography>

              <Typography
                component='div'
                variant='body2'
                className='info-caption'
              >
                <div className='info-caption-item item-author'>
                  <MailOutlineOutlinedIcon
                    className='mail-icon'
                    fontSize='small'
                  />
                  <Box
                    sx={{
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      display: 'inline-block',
                      maxWidth: '100%',
                    }}
                  >
                    {item.author}
                  </Box>
                </div>
                <Box
                  className='info-caption-item item-time'
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    marginLeft: '8px',
                  }}
                >
                  <AccessTimeOutlinedIcon
                    className='time-icon'
                    fontSize='small'
                  />
                  <DateTimeDisplay itemDate={itemDate} />
                </Box>
              </Typography>
            </React.Fragment>
          }
          secondary={`${commitMessage} `}
          slotProps={{
            primary: { noWrap: true },
            secondary: { noWrap: true },
          }}
        />
        <IconButton
          name='close-button'
          title='remove revision'
          className={`${iconClassName} revision-action close-button`}
          onClick={() => onRemoveRevision(item)}
        >
          <CloseOutlined fontSize='small' data-testid='close-icon' />
        </IconButton>
      </Box>
    </ListItem>
  );
}

export default SelectedRevisionItem;
