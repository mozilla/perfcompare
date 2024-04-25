import { stylesheet } from 'typestyle';

import { FontsRaw, Spacing } from '../styles';

export const SearchContainerStyles = (mode: string, isHome: boolean) => {
  const isTrueLight = mode == 'light';

  const styles = stylesheet({
    container: {
      maxWidth: isHome ? '850px' : '950px',
      marginTop: isHome ? `${Spacing.layoutLarge + 20}px` : '0px',
      margin: '0 auto',
      marginBottom: isHome ? '0px' : `${Spacing.layoutXLarge + 4}px`,
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
