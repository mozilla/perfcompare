import { stylesheet } from 'typestyle';

import { FontsRaw, Spacing } from '../styles';

export const SearchContainerStyles = (mode: string, isHome: boolean) => {
  const isTrueLight = mode == 'light';

  const styles = stylesheet({
    container: {
      /*** maxWidth based on mozilla protocol large cards size; see https://protocol.mozilla.org/components/detail/card--large
       ***/
      maxWidth: '973px',
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
