import { HTMLAttributes } from 'react';

import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Radio from '@mui/material/Radio';
import Typography from '@mui/material/Typography';
import { style } from 'typestyle';

import DateTimeDisplay from './DateTimeDisplay';
import { Spacing } from '../../styles';
import type { Changeset } from '../../types/state';
import { truncateHash, getLatestCommitMessage } from '../../utils/helpers';

interface AutocompleteOptionProps {
  index: number;
  item: Changeset;
  isChecked: boolean;
  onToggle: (item: Changeset) => void;
  listItemComponent?: 'checkbox' | 'radio';
}

type AutocompleteOptionWithHTMLProps = AutocompleteOptionProps &
  Omit<HTMLAttributes<HTMLLIElement>, 'onToggle'>;

const styles = {
  container: style({
    display: 'flex',
    alignItems: 'flex-start',
    padding: `${Spacing.xSmall}px ${Spacing.Small}px`,
    paddingTop: 0,
    cursor: 'pointer',
    width: '100%',
    $nest: {
      '&:hover': {
        backgroundColor: 'inherit', // Let parent handle hover
      },
      '.search-revision-item-icon': {
        minWidth: '0',
      },
      '.search-revision-item-text': {
        flex: 1,
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

function AutocompleteOption({
  index,
  item,
  isChecked,
  onToggle,
  listItemComponent,
  ...htmlProps
}: AutocompleteOptionWithHTMLProps) {
  const ListItemComponent = listItemComponent === 'radio' ? Radio : Checkbox;
  const revisionHash = truncateHash(item.revision);
  const commitMessage = getLatestCommitMessage(item);
  const itemDate = new Date(item.push_timestamp * 1000);

  const onToggleAction = () => {
    onToggle(item);
  };

  return (
    <li
      {...htmlProps}
      className={`${styles.container} search-revision-item search-revision ${
        isChecked ? 'item-selected' : ''
      }`}
      onClick={onToggleAction}
      data-testid='autocomplete-option'
    >
      <Box className='search-revision-item-icon search-revision'>
        <ListItemComponent
          className='search-revision-item-checkbox'
          tabIndex={-1}
          disableRipple
          data-testid={`checkbox-${index}`}
          checked={isChecked}
          role='button'
        />
      </Box>

      <Box className='search-revision-item-text'>
        <Box className='MuiListItemText-primary'>
          <Typography
            component='span'
            variant='body2'
            color='textPrimary'
            className='revision-hash'
          >
            {revisionHash}
          </Typography>
          <div className='info-caption'>
            <div className='info-caption-item item-author'>
              <MailOutlineOutlinedIcon className='mail-icon' fontSize='small' />
              {item.author}
            </div>

            <div className='info-caption-item item-time'>
              <AccessTimeOutlinedIcon className='time-icon' fontSize='small' />
              <DateTimeDisplay itemDate={itemDate} />
            </div>
          </div>
        </Box>

        <Typography
          variant='body2'
          color='textSecondary'
          className='commit-message'
        >
          {commitMessage}
        </Typography>
      </Box>
    </li>
  );
}

export default AutocompleteOption;
