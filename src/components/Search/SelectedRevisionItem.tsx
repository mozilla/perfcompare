import * as React from 'react';

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
import { useNavigate } from 'react-router-dom';

import { repoMap, searchView } from '../../common/constants';
import { useAppSelector } from '../../hooks/app';
import useCheckRevision from '../../hooks/useCheckRevision';
import useSelectedRevisions from '../../hooks/useSelectedRevisions';
import { Strings } from '../../resources/Strings';
import { SelectRevsStyles } from '../../styles';
import type { RevisionsList } from '../../types/state';
import { InputType, ThemeMode, View } from '../../types/state';
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
  mode: ThemeMode;
  repository: Repository['name'];
  searchType: InputType;
  isWarning?: boolean;
  view: View;
  editBtnVisible?: boolean;
}

function SelectedRevisionItem({
  index,
  item,
  mode,
  repository,
  searchType,
  isWarning,
  view,
  editBtnVisible,
}: SelectedRevisionItemProps) {
  const styles = SelectRevsStyles(mode);
  const revisionHash = truncateHash(item.revision);
  const commitMessage = getLatestCommitMessage(item);
  const itemDate = new Date(item.push_timestamp * 1000);
  const { removeCheckedRevision } = useCheckRevision(searchType);
  const { deleteSelectedRevisions } = useSelectedRevisions();
  const selectedRevisions = useAppSelector(
    (state) => state.selectedRevisions.revisions,
  );
  const selectedFramework = useAppSelector(
    (state) => state.searchCompareWithBase.framework,
  );
  const navigate = useNavigate();
  const prevRevRef = React.useRef<RevisionsList[]>([]);

  const updateRevsInHash = () => {
    const revs = selectedRevisions.map((rev) => rev.revision);
    const repos = selectedRevisions.map((rev) => repoMap[rev.repository_id]);

    navigate({
      pathname: '/compare-results',
      search: `?revs=${revs.join(',')}&repos=${repos.join(',')}&framework=${
        selectedFramework.id
      }`,
    });
  };

  React.useEffect(() => {
    if (
      prevRevRef.current !== selectedRevisions &&
      selectedRevisions.length > 0
    ) {
      updateRevsInHash();
    }

    prevRevRef.current = selectedRevisions;
  }, [selectedRevisions]);

  const handleClose = () => {
    if (view == searchView || !editBtnVisible) {
      removeCheckedRevision(item);
    } else {
      deleteSelectedRevisions(item);
    }
    return;
  };

  const renderCloseIcon = () => {
    //hide the close icon for the base component in the compare results view and if edit button is visible
    const iconClassName =
      editBtnVisible && view !== searchView && searchType === 'base'
        ? 'icon icon-close-base-hidden'
        : 'icon icon-close-show';

    return (
      <CloseOutlined
        className={iconClassName}
        fontSize='small'
        data-testid='close-icon'
      />
    );
  };

  return (
    <div
      className={`item-container item-${index} item-${searchType}`}
      data-testid='selected-rev-item'
    >
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
            className='revision-action close-button'
            onClick={handleClose}
          >
            {renderCloseIcon()}
          </Button>
        </ListItem>
      </ListItemButton>
    </div>
  );
}

export default SelectedRevisionItem;
