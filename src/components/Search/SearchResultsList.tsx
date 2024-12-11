import Box from '@mui/material/Box';
import List from '@mui/material/List';
import { style } from 'typestyle';

import SearchResultsListItem from './SearchResultsListItem';
import { useAppSelector } from '../../hooks/app';
import {
  Colors,
  FontsRaw,
  Spacing,
  captionStylesLight,
  captionStylesDark,
} from '../../styles';
import { Changeset } from '../../types/state';

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
  maxHeight: '285px',
  overflow: 'auto',
  maxWidth: '100%',
  padding: `${Spacing.xSmall}px`,
  border: `1px solid ${Colors.BorderDefault}`,
  zIndex: 100,
};

function getStyles(theme: string) {
  const backgroundColor =
    theme === 'light' ? Colors.Background300 : Colors.Background300Dark;
  const hoverColor =
    theme === 'light' ? Colors.SecondaryHover : Colors.SecondaryHoverDark;
  const activeColor =
    theme === 'light' ? Colors.SecondaryActive : Colors.SecondaryActiveDark;
  const captionStyle =
    theme === 'light' ? captionStylesLight : captionStylesDark;

  return style({
    backgroundColor,
    position: 'relative',
    ...sharedSelectStyles,
    $nest: {
      '.MuiListItemButton-root': {
        padding: `${Spacing.xSmall}px ${Spacing.Small}px`,
        $nest: {
          '&:hover': {
            backgroundColor: hoverColor,
            borderRadius: '4px',
          },
          '&:active': {
            backgroundColor: activeColor,
            borderRadius: '4px',
          },
        },
      },
      '.item-selected': {
        backgroundColor: hoverColor,
        borderRadius: '4px',
      },
      '.revision-hash': {
        ...FontsRaw.BodyDefault,
        marginRight: Spacing.Small,
      },
      '.info-caption': {
        ...captionStyle,
      },
      '.MuiTypography-root': {
        ...FontsRaw.BodyDefault,
      },
    },
  });
}

function SearchResultsList({
  compact,
  searchResults,
  displayedRevisions,
  onToggle,
  listItemComponent,
}: SearchResultsListProps) {
  const mode = useAppSelector((state) => state.theme.mode);
  const styles = {
    light: getStyles('light'),
    dark: getStyles('dark'),
  };
  // const styles = mode === 'light' ? SelectListLight : SelectListDark;

  const isInProgressChecked = (item: Changeset) => {
    return displayedRevisions.map((rev) => rev.id).includes(item.id);
  };

  return (
    <Box
      className={`${styles[mode]} results-list-${mode}`}
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
