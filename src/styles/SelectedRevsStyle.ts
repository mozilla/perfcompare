import { stylesheet } from 'typestyle';

import {
  Colors,
  FontsRaw,
  FontSizeRaw,
  Spacing,
  captionStylesLight,
  captionStylesDark,
} from '../styles';

export const SelectRevsStyles = (mode: string) => {
  const isTrueLight = mode == 'light' ? true : false;

  const styles = stylesheet({
    box: {
      height: 'auto',
      border: 'none',
      padding: 0,

      $nest: {
        '.item-container': {
          ...(isTrueLight ? FontsRaw.BodyDefault : FontsRaw.BodyDefaultDark),
          backgroundColor: isTrueLight
            ? Colors.Background200
            : Colors.Background200Dark,
          display: 'flex',
          marginBottom: `${Spacing.Small}px`,
          borderRadius: Spacing.xSmall,
          padding: `${Spacing.Small + 4}px ${Spacing.Small}px ${
            Spacing.Small + 4
          }px  ${Spacing.Medium}px`,
        },
      },
    },

    repo: {
      minWidth: '191px',
    },

    listItemButton: {
      padding: '0 !important',
      $nest: {
        '&:hover': {
          backgroundColor: 'transparent !important',
        },

        '.MuiListItem-root': {
          alignItems: 'flex-start',
          padding: 0,
        },

        '.search-revision-item-icon': {
          minWidth: '0',
          marginLeft: `${Spacing.Small + 6}px`,
        },
        '.search-revision-item-text': {
          margin: 0,
        },

        '.MuiListItemText-primary': {
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          marginBottom: `${Spacing.xSmall}px`,
          alignItems: 'center',
        },
        '.info-caption': {
          ...(isTrueLight ? captionStylesLight : captionStylesDark),
          $nest: {
            '.info-caption-item': {
              ...FontsRaw.BodySmallDark,
              display: 'flex',
              alignItems: 'center',
              fontSize: '11px',
              color: isTrueLight
                ? Colors.SecondaryText
                : Colors.SecondaryTextDark,
            },

            svg: {
              marginRight: `${Spacing.xSmall}px`,
              fontSize: '1rem',
            },
            '.item-author': {
              marginRight: `${Spacing.xSmall + 1}px`,
              fontSize: FontSizeRaw.Small.fontSize,
            },
          },
        },
        button: {
          padding: 0,
        },
      },
    },
  });
  return styles;
};
