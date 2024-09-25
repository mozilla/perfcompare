import { Colors } from './Colors';
import { FontsRaw } from './Fonts';
import { Spacing } from './Spacing';

const sharedCaptionStyles = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderRadius: '8px',
  padding: `${Spacing.xSmall / 2}px ${Spacing.Small}px`,
  minWidth: '284px',
};

export const captionStylesLight = {
  ...sharedCaptionStyles,
  backgroundColor: Colors.Background100,

  $nest: {
    '.info-caption-item': {
      ...FontsRaw.BodySmallDark,
      display: 'flex',
      alignItems: 'center',
      fontSize: '11px',
      color: Colors.SecondaryText,
    },
  },
};

export const captionStylesDark = {
  ...sharedCaptionStyles,
  backgroundColor: Colors.SecondaryDark,

  $nest: {
    '.info-caption-item': {
      ...FontsRaw.BodySmall,
      display: 'flex',
      alignItems: 'center',
      fontSize: '11px',
      color: Colors.SecondaryTextDark,
    },
  },
};
