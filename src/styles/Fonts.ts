import { style } from 'typestyle';

import { Colors } from './Colors';

const sharedFontStyles = {
  fontStyle: 'normal',
  color: Colors.PrimaryText,
};

const sharedFontStylesDark = {
  fontStyle: 'normal',
  color: Colors.PrimaryTextDark,
};

//fontFamily: 'SF Pro',
export const FontsRaw = {
  HeadingDefault: {
    ...sharedFontStyles,
    lineHeight: '22px',
    fontWeight: '600',
    fontSize: '17px',
  },

  //fontFamily: 'Metropolis',
  HeadingXS: {
    ...sharedFontStyles,
    lineHeight: '28px',
    fontWeight: '700',
    fontSize: '24px',
  },

  //fontFamily: 'SF Pro',
  BodyDefault: {
    ...sharedFontStyles,
    lineHeight: '16px',
    fontWeight: '400',
    fontSize: '14px',
  },

  //fontFamily: 'SF Pro',
  BodySmall: {
    ...sharedFontStyles,
    lineHeight: '14px',
    fontWeight: '400',
    fontSize: '12px',
  },

  //DARK MODE FONTS

  //fontFamily: 'SF Pro'
  HeadingDefaultDark: {
    ...sharedFontStylesDark,
    lineHeight: '22px',
    fontWeight: '600',
    fontSize: '17px',
  },

  //fontFamily: 'Metropolis',
  HeadingXSDark: {
    ...sharedFontStylesDark,
    lineHeight: '28px',
    fontWeight: '700',
    fontSize: '24px',
  },

  //fontFamily: 'SF Pro',
  BodyDefaultDark: {
    ...sharedFontStylesDark,
    lineHeight: '16px',
    fontWeight: '400',
    fontSize: '14px',
  },

  //fontFamily: 'SF Pro',
  BodySmallDark: {
    ...sharedFontStylesDark,
    lineHeight: '14px',
    fontWeight: '400',
    fontSize: '12px',
  },
};

export const Fonts = {
  HeadingDefault: style(FontsRaw.HeadingDefault),
  HeadingXS: style(FontsRaw.HeadingXS),
  BodyDefault: style(FontsRaw.BodyDefault),
  BodySmall: style(FontsRaw.BodySmall),
  HeadingDefaultDark: style(FontsRaw.HeadingDefaultDark),
  HeadingXSDark: style(FontsRaw.HeadingXSDark),
  BodyDefaultDark: style(FontsRaw.BodyDefaultDark),
  BodySmallDark: style(FontsRaw.BodySmallDark),
};

export const FontSizeRaw = {
  xSmall: {
    fontSize: `${12 / 16}rem`,
  },
  Small: {
    fontSize: `${14 / 16}rem`,
  },
  Normal: {
    fontSize: '1rem',
  },
  Large: {
    fontSize: `${18 / 16}rem`,
  },
  xLarge: {
    fontSize: `${20 / 16}rem`,
  },
  xxLarge: {
    fontSize: `${24 / 16}rem`,
  },
};

export const FontSize = {
  xSmall: style(FontSizeRaw.xSmall),
  Small: style(FontSizeRaw.Small),
  Normal: style(FontSizeRaw.Normal),
  Large: style(FontSizeRaw.Large),
  xLarge: style(FontSizeRaw.xLarge),
  xxLarge: style(FontSizeRaw.xxLarge),
};
