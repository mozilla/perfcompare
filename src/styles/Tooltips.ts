import { Colors } from './Colors';
import { Spacing } from './Spacing';

export const ToolTipsShared = {
  borderRadius: `${Spacing.xSmall}px`,
  maxWidth: '185px',
  display: 'flex',
  justifyContent: 'center',
  padding: `${Spacing.Small}px`,
};

export const TooltipRaw = {
  Light: {
    ...ToolTipsShared,
    backgroundColor: Colors.SecondaryHover,
    color: Colors.PrimaryText,
    boxShadow: Colors.ShadowLight,
  },
  Dark: {
    ...ToolTipsShared,
    backgroundColor: Colors.SecondaryHoverDark,
    color: Colors.PrimaryTextDark,
    boxShadow: Colors.ShadowDark,
  },
};
