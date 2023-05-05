import { style } from 'typestyle';

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
    boxShadow: Colors.ShadowLight,
  },
  Dark: {
    ...ToolTipsShared,
    backgroundColor: Colors.SecondaryHoverDark,
    boxShadow: Colors.ShadowDark,
  },
};

export const Tooltips = {
  TooltipLight: style(TooltipRaw.Light),
  TooltipDark: style(TooltipRaw.Dark),
};
