import { stylesheet } from 'typestyle';

import { FontsRaw, Spacing } from '../styles';

export const SearchContainerStyles = (
  mode: string,
  view: 'search' | 'compare-results',
) => {
  const isTrueLight = mode == 'light' ? true : false;
  const isSearch = view == 'search' ? true : false;

  const styles = stylesheet({
    container: {
      maxWidth: isSearch ? '810px' : '950px',
      marginTop: isSearch ? `${Spacing.layoutLarge + 20}px` : '0px',
      margin: '0 auto',
      marginBottom: isSearch ? '0px' : `${Spacing.layoutXLarge + 4}px`,
      display: 'flex',
      justifyContent: 'center',
      flexDirection: 'column',
      $nest: {
        '.search-default-title': {
          ...(isTrueLight ? FontsRaw.HeadingXS : FontsRaw.HeadingXSDark),
          marginBottom: `${Spacing.xLarge + 10}px`,
          textAlign: 'center',
        },
      },
    },
  });

  return styles;
};
