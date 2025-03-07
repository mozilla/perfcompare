import { Colors } from './Colors';
import { Spacing } from './Spacing';

const typography = {
  fontFamily: 'SF Pro',
  fontStyle: 'normal',
  fontWeight: 590,
  fontSize: '16px',
  lineHeight: '1.5',
};

export const ToolTipsShared = {
  borderRadius: `${Spacing.xSmall}px`,
  maxWidth: '185px',
  display: 'flex',
  justifyContent: 'center',
  padding: `${Spacing.Small}px`,
  ...typography,
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
