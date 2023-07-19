import { stylesheet } from 'typestyle';

import { Strings } from '../resources/Strings';
import {
  FontsRaw,
  Spacing,
  Colors,
  CardsDarkRaw,
  CardsLightRaw,
} from '../styles';

const strings = Strings.components.searchDefault;

const textLightMode = {
  color: `${Colors.PrimaryText} !important`,
};

const textDarkMode = {
  color: `${Colors.PrimaryTextDark} !important`,
};

export const CompareCardsStyles = (mode: string, height: number) => {
  const isTrueLight = mode == 'light' ? true : false;

  const compareCardsCSS = stylesheet({
    container: {
      ...(isTrueLight ? CardsLightRaw : CardsDarkRaw),
      width: '100%',
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      cursor: 'pointer',
      transition: 'border-radius 0.4s ease-in-out',
      $nest: {
        '.compare-card-img': {
          minWidth: '194px',
          borderRadius: `0px ${Spacing.Small}px ${Spacing.Small}px 0px`,
          display: 'grid',
          justifyContent: 'center',
          alignContent: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          background: isTrueLight
            ? Colors.Background200
            : Colors.Background200Dark,
          $nest: {
            '&.compare-card-img--time': {
              backgroundImage: `url(${
                isTrueLight ? strings.overTime.img : strings.overTime.imgDark
              })`,
            },
            '&.compare-card-img--base': {
              backgroundImage: `url(${
                isTrueLight ? strings.base.img : strings.base.imgDark
              })`,
            },
          },
        },
        '&.compare-card-container--time': {
          visibility: 'hidden',
          marginTop: `${Spacing.Large}px`,
          marginBottom: `${Spacing.layoutLarge + 20}px`,
        },
        '&.compare-card-container--expanded': {
          borderRadius: `${Spacing.Small}px ${Spacing.Small}px 0px 0px`,
          boxShadow: '0px 2px 4px rgba(58, 57, 68, 0.2)',
        },
        '&.content-base': {
          minHeight: '0',
          height: '0',
          flexWrap: 'nowrap',
          overflow: 'hidden',
          transition: 'min-height 0.5s ease-in-out',
          flexDirection: 'column',
          borderRadius: `0px 0px ${Spacing.Small}px ${Spacing.Small}px`,
          cursor: 'default',
          $nest: {
            '&.content-base--expanded': {
              borderRadius: `0px 0px ${Spacing.Small}px ${Spacing.Small}px`,
              borderTop: isTrueLight
                ? Colors.Background200
                : Colors.Background200Dark,
              $nest: {
                '.compare-card-img': {
                  borderRadius: `0px ${Spacing.Small}px 0px 0px`,
                },
              },
              height: 'auto',
              minHeight: height > 400 ? `${height + 10}px` : '315px',
            },
            '.form-wrapper': {
              padding: `${Spacing.xxLarge}px ${Spacing.xxLarge + 2}px`,
            },
          },
        },
      },
    },

    cardText: {
      paddingLeft: `${Spacing.xxLarge}px`,
      paddingTop: `${Spacing.xxLarge + 8}px`,
      paddingBottom: `${Spacing.xxLarge + 8}px`,
      paddingRight: `${Spacing.xLarge + 14}px`,
      width: '76%',
      $nest: {
        '.compare-card-title': {
          ...(isTrueLight
            ? FontsRaw.HeadingDefault
            : FontsRaw.HeadingDefaultDark),
        },
        '.compare-card-tagline': {
          ...(isTrueLight ? FontsRaw.BodyDefault : FontsRaw.BodyDefaultDark),
        },
      },
    },
  });

  return compareCardsCSS;
};
export const SearchStyles = (mode: string) => {
  const isTrueLight = mode == 'light' ? true : false;

  const searchCSS = stylesheet({
    component: {
      marginBottom: `${Spacing.xLarge}px`,
    },
    container: {
      margin: 'auto',
      justifyContent: 'space-between',
      position: 'relative',
    },

    dropDown: {
      minWidth: '200px',
      $nest: {
        '& .dropdown-select-label': {
          ...(isTrueLight ? FontsRaw.BodyDefault : FontsRaw.BodyDefaultDark),
          fontWeight: '600',
          marginBottom: `${Spacing.xSmall + 2}px`,
          display: 'flex',
          alignItems: 'center',
          transform: 'unset',
          position: 'relative',
          ...(isTrueLight ? textLightMode : textDarkMode),
        },
        '.dropdown-info-icon': {
          marginLeft: `${Spacing.xSmall}px`,
          cursor: 'pointer',
        },
        '.MuiSvgIcon-root': {
          color: isTrueLight ? Colors.IconLight : Colors.IconDark,
        },
      },
    },

    baseSearchInput: {
      minWidth: '490px',
      width: '100%',
      position: 'absolute',
      left: '220px',
      $nest: {
        '&.base-search-input--mobile, &.new-search-input--mobile': {
          position: 'unset',
        },
        '&.base-search-input': {
          zIndex: '100',
        },
      },
    },
  });

  return searchCSS;
};
