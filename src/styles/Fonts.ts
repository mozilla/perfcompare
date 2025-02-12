import { style, fontFace } from 'typestyle';

import metropolisFontURL from '../../public/fonts/Metropolis-Bold.woff2';
import sfFontURL from '../../public/fonts/sf-pro-text-regular.woff';

fontFace({
  fontFamily: 'Metropolis',
  src: `url(${metropolisFontURL}) format("woff2")`,
});

fontFace({
  fontFamily: 'SF Pro',
  src: `url(${sfFontURL}) format("woff")`,
});

const sharedFontStyles = {
  fontStyle: 'normal',
};

export const FontsRaw = {
  HeadingDefault: {
    ...sharedFontStyles,
    fontWeight: '600',
    fontSize: '17px',
    fontFamily: 'SF Pro',
    fontStyle: 'normal',
  },

  HeadingXS: {
    ...sharedFontStyles,
    fontSize: '24px',
    fontFamily: 'Metropolis',
  },

  BodyDefault: {
    ...sharedFontStyles,
    fontWeight: '400',
    fontSize: '14px',
    fontFamily: 'SF Pro',
  },

  //DARK MODE FONTS

  HeadingDefaultDark: {
    ...sharedFontStyles,
    fontWeight: '600',
    fontSize: '17px',
    fontFamily: 'SF Pro',
  },

  HeadingXSDark: {
    ...sharedFontStyles,
    fontSize: '24px',
    fontFamily: 'Metropolis',
  },

  BodyDefaultDark: {
    ...sharedFontStyles,
    fontWeight: '400',
    fontSize: '14px',
    fontFamily: 'SF Pro',
  },
};

export const Fonts = {
  HeadingDefault: style(FontsRaw.HeadingDefault),
  HeadingXS: style(FontsRaw.HeadingXS),
  BodyDefault: style(FontsRaw.BodyDefault),
  HeadingDefaultDark: style(FontsRaw.HeadingDefaultDark),
  HeadingXSDark: style(FontsRaw.HeadingXSDark),
  BodyDefaultDark: style(FontsRaw.BodyDefaultDark),
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
