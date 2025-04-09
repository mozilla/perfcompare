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
      padding: 0,
      marginTop: `${Spacing.xSmall + 2}px`,

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
            : Colors.Background300Dark,
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
      minWidth: '125px',
      display: 'flex',
      $nest: {
        '.warning-icon': {
          marginLeft: `${Spacing.Large}px`,
        },
      },
    },

    selectedRevision: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      flexGrow: 1,
      minWidth: '0px',
      gap: `${Spacing.Small}px`,
      $nest: {
        '.search-revision-item-text': {
          margin: 0,
          flex: 1,
          fontSize: FontSizeRaw.Normal.fontSize,
        },

        '.revision-hash': {
          display: 'flex',
          flexShrink: 0,
          minWidth: '147px',
          textAlign: 'center',
        },

        '.MuiListItemText-primary': {
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: `${Spacing.xSmall}px`,
          alignItems: 'center',
          overflow: 'visible',
          flexGrow: 1,
        },
        '.info-caption': {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '100%',
          marginLeft: `${Spacing.Small}px`,
          ...(isTrueLight ? captionStylesLight : captionStylesDark),
          fontSize: FontSizeRaw.Normal.fontSize,
          $nest: {
            '.info-caption-item': {
              display: 'flex',
              alignItems: 'center',
              color: isTrueLight
                ? Colors.SecondaryText
                : Colors.SecondaryTextDark,
            },
            svg: {
              marginRight: `${Spacing.xSmall}px`,
              fontSize: '1rem',
            },
            '.item-author': {
              maxWidth: '100%',
              overflow: 'hidden',
              marginRight: `${Spacing.xSmall + 1}px`,
            },
          },
        },

        button: {
          padding: 2,
          marginTop: -2,
          flexShrink: 0,
          $nest: {
            '&.close-button': {
              marginLeft: `${Spacing.Large}px`,
            },
            '&.icon-close-show': {
              color: isTrueLight ? Colors.IconLight : Colors.IconDark,
            },
            '&.icon-close-hidden': {
              visibility: 'hidden',
            },
          },
        },
      },
    },
  });
  return styles;
};
