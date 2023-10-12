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
        '&.show-base-close-icon': {
          $nest: {
            '.icon-close-base-hidden': {
              display: 'block',
            },
          },
        },
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
      display: 'flex',
      $nest: {
        '.warning-icon': {
          marginLeft: `${Spacing.Large}px`,
        },
      },
    },

    listItemButton: {
      cursor: 'auto !important',
      padding: '0 !important',
      alignItems: 'flex-start !important',
      $nest: {
        '&:hover': {
          backgroundColor: 'transparent !important',
        },

        '.search-revision-item-icon': {
          minWidth: '0',
          marginLeft: `${Spacing.Small + 6}px`,
        },
        '.search-revision-item-text': {
          margin: 0,
          minWidth: '434px',
        },

        '.revision-hash': {
          minWidth: '147px',
        },

        '.MuiListItemText-primary': {
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: `${Spacing.xSmall}px`,
          alignItems: 'center',
          overflow: 'visible',
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
          justifyContent: 'flex-end',
          $nest: {
            '&.revision-action': {
              minWidth: '14px',
              height: '14px',
            },
            '&.close-button': {
              marginLeft: `${Spacing.Large}px`,
            },
            '&.close-button-results': {
              marginLeft: `${Spacing.layoutXLarge + 44}px`,
            },

            svg: {
              width: '0.875rem',
              height: '0.875rem',
            },
            '.icon-close-show': {
              color: isTrueLight ? Colors.IconLight : Colors.IconDark,
            },
            '.icon-close-base-hidden': {
              display: 'none',
            },
          },
        },
      },
    },
  });
  return styles;
};
