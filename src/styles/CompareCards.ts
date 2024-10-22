import { stylesheet } from 'typestyle';

import clockDark from '../assets/clock-dark.svg';
import clockLight from '../assets/clock-light.svg';
import overlappingCirclesDark from '../assets/overlapping-circles-dark.svg';
import overlappingCirclesLight from '../assets/overlapping-circles-light.svg';
import {
  FontsRaw,
  Spacing,
  Colors,
  CardsDarkRaw,
  CardsLightRaw,
} from '../styles';

const textLightMode = {
  color: `${Colors.PrimaryText} !important`,
};

const textDarkMode = {
  color: `${Colors.PrimaryTextDark} !important`,
};

const repoDropdownWidth = 200;

export const CompareCardsStyles = (mode: string) => {
  const isTrueLight = mode == 'light' ? true : false;

  const overlappingCircles = isTrueLight
    ? overlappingCirclesLight
    : overlappingCirclesDark;

  const clock = isTrueLight ? clockLight : clockDark;

  const compareCardsCSS = stylesheet({
    container: {
      ...(isTrueLight ? CardsLightRaw : CardsDarkRaw),
      width: '100%',
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      cursor: 'pointer',
      transition: 'border-radius 0.4s ease-in-out',
      justifyContent: 'space-between',
      $nest: {
        ul: {
          padding: '0',
        },
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
            : Colors.Background300Dark,
          $nest: {
            '&.compare-card-img--time': {
              backgroundImage: `url(${clock.toString()})`,
            },
            '&.compare-card-img--base': {
              backgroundImage: `url(${overlappingCircles.toString()})`,
            },
          },
        },
        '.edit-btn-wrapper': {
          display: 'flex',
          justifyContent: 'end',
          $nest: {
            '&.show-edit-btn': {
              visibility: 'visible',
            },
            '&.hide-edit-btn': {
              visibility: 'hidden',
            },
          },
        },
        '&.compare-card-container--time': {
          marginTop: `${Spacing.Large}px`,
          marginBottom: `${Spacing.layoutLarge + 20}px`,
        },
        '&.compare-card-container--expanded': {
          borderRadius: `${Spacing.Small}px ${Spacing.Small}px 0px 0px`,
          boxShadow: '0px 2px 4px rgba(58, 57, 68, 0.2)',
        },
        '&.content-base': {
          visibility: 'hidden',
          minHeight: '0',
          height: '0',
          flexWrap: 'nowrap',
          transition: 'min-height 0.5s ease-in-out',
          flexDirection: 'column',
          borderRadius: `0px 0px ${Spacing.Small}px ${Spacing.Small}px`,
          cursor: 'default',
          $nest: {
            '&.content-base--expanded': {
              visibility: 'visible',
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
          margin: '0px',
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
      marginBottom: `${Spacing.Large}px`,
      $nest: {
        // the Revisions section of the search form does not need margin
        '&:last-of-type': {
          marginBottom: 0,
        },
      },
    },

    container: {
      justifyContent: 'space-between',
      position: 'relative',
      $nest: {
        '&.hide-container': {
          display: 'none',
        },
      },
    },

    dropDown: {
      minWidth: `${repoDropdownWidth}px`,
      marginBottom: `${Spacing.xSmall + 2}px`,
      $nest: {
        '.dropdown-select-label,.base_label': {
          ...(isTrueLight ? FontsRaw.BodyDefault : FontsRaw.BodyDefaultDark),
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          transform: 'unset',
          position: 'relative',
          ...(isTrueLight ? textLightMode : textDarkMode),
        },
        '.dropdown-info-icon': {
          marginLeft: `${Spacing.xSmall}px`,
          cursor: 'pointer',
          width: '16px',
          height: '16px',
        },
        '.MuiSvgIcon-root': {
          color: isTrueLight ? Colors.PrimaryText : Colors.IconDark,
        },
      },
    },

    baseSearchInput: {
      minWidth: '530px',
      position: 'absolute',
      left: '220px',
      $nest: {
        '&.big': {
          left: '212px',
          minWidth: `${850 - repoDropdownWidth - Spacing.Default}px`,
        },
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
