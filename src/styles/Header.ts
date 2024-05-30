import { stylesheet } from 'typestyle';

import { Strings } from '../resources/Strings';
import { Colors } from './Colors';
import { Spacing } from './Spacing';

const strings = Strings.components.header;

export const HeaderStyles = (mode: string, isHome: boolean) => {
  const isTrueLight = mode == 'light';
  const lightBg = isHome ? Colors.Background200 : '#ffffff';
  const darkBg = isHome ? Colors.Background200Dark : Colors.Background100Dark;

  const styles = stylesheet({
    container: {
      padding: 0,
      width: '100%',
      minHeight: isHome ? '357px' : '130px',
      backgroundColor: isTrueLight ? lightBg : darkBg,
      backgroundImage: isHome ? strings.bgLink : 'none',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundPositionY: 'top',
      $nest: {
        '.header-text': {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          maxWidth: '472px',
          margin: '0 auto',
        },
        '.perfcompare-header': {
          marginBottom: isHome
            ? `${Spacing.Large}px`
            : `${Spacing.xxLarge - 6}px`,
        },
        '.perfcompare-tagline': {
          marginBottom: `${Spacing.xxLarge}px`,
        },
        '.MuiButtonBase-root': {
          marginBottom: `${Spacing.layoutLarge + 14}px`,
          maxWidth: '104px',
          alignSelf: 'center',
        },
        '.learn-more-btn': {
          //hidden until purpose is determined
          visibility: 'hidden',
        },
      },
    },
  });

  return styles;
};
