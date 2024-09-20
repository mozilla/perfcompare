import Box from '@mui/material/Box';
import List from '@mui/material/List';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import {
  Colors,
  FontsRaw,
  Spacing,
  captionStylesLight,
  captionStylesDark,
} from '../../styles';
import { Changeset } from '../../types/state';
import SearchResultsListItem from './SearchResultsListItem';

interface SearchResultsListProps {
  compact: boolean;
  searchResults: Changeset[];
  displayedRevisions: Changeset[];
  onToggle: (item: Changeset) => void;
  listItemComponent?: 'checkbox' | 'radio';
}

const sharedSelectStyles = {
  borderRadius: '4px',
  marginTop: `${Spacing.xSmall}px`,
  height: '285px',
  overflow: 'auto',
  maxWidth: '100%',
  padding: `${Spacing.xSmall}px`,
  border: `1px solid ${Colors.BorderDefault}`,
};

const SelectListLight = style({
  backgroundColor: Colors.Background300,
  zIndex: 100,
  position: 'relative',
  ...sharedSelectStyles,
  $nest: {
    '.MuiListItemButton-root': {
      padding: `${Spacing.xSmall}px ${Spacing.Small}px`,
      $nest: {
        '&:hover': {
          backgroundColor: Colors.SecondaryHover,
          borderRadius: '4px',
        },
        '&:active': {
          backgroundColor: Colors.SecondaryActive,
          borderRadius: '4px',
        },
      },
    },
    '.item-selected': {
      backgroundColor: Colors.SecondaryHover,
      borderRadius: '4px',
    },
    '.revision-hash': {
      ...FontsRaw.BodyDefault,
      marginRight: Spacing.Small,
    },
    '.info-caption': {
      ...captionStylesLight,
    },
    '.MuiTypography-root': {
      ...FontsRaw.BodyDefault,
    },
  },
});

const SelectListDark = style({
  backgroundColor: Colors.Background300Dark,
  zIndex: 100,
  position: 'relative',
  ...sharedSelectStyles,
  $nest: {
    '.MuiListItemButton-root': {
      padding: `${Spacing.xSmall}px ${Spacing.Small}px`,

      $nest: {
        '&:hover': {
          backgroundColor: Colors.SecondaryHoverDark,
          borderRadius: '4px',
        },
        '&:active': {
          backgroundColor: Colors.SecondaryActiveDark,
          borderRadius: '4px',
        },
      },
    },
    '.item-selected': {
      backgroundColor: Colors.SecondaryHoverDark,
      borderRadius: '4px',
    },
    '.revision-hash': {
      ...FontsRaw.BodyDefault,
      marginRight: Spacing.Small,
    },
    '.info-caption': {
      ...captionStylesDark,
    },
    '.MuiTypography-root': {
      ...FontsRaw.BodyDefaultDark,
    },
  },
});

function SearchResultsList({
  compact,
  searchResults,
  displayedRevisions,
  onToggle,
  listItemComponent,
}: SearchResultsListProps) {
  const mode = useAppSelector((state) => state.theme.mode);
  const styles = mode === 'light' ? SelectListLight : SelectListDark;

  const isInProgressChecked = (item: Changeset) => {
    return displayedRevisions.map((rev) => rev.id).includes(item.id);
  };

  return (
    <Box
      className={`${styles} results-list-${mode}`}
      id='search-results-list'
      alignItems='flex-end'
      data-testid='list-mode'
    >
      <List dense={compact} sx={{ paddingTop: '0' }}>
        {searchResults.map((item, index) => (
          <SearchResultsListItem
            key={item.id}
            index={index}
            item={item}
            isChecked={isInProgressChecked(item)}
            onToggle={onToggle}
            listItemComponent={listItemComponent}
          />
        ))}
      </List>
    </Box>
  );
}

export default SearchResultsList;
