import { style } from 'typestyle';

export const FontsRaw = {
  Heading1: {
    lineHeight: '16',
		fontWeight: '600',
		fontSize: '14px',
  },

	BodyDefault: {
		lineHeight: '16',
		fontWeight: '400',
		fontSize: '14px',
	},

  BodySmallRegular: {
		lineHeight: '14',
		fontWeight: '400',
		fontSize: '12px',
  },

  BodyXSmallRegular: {
    lineHeight: '11',
		fontWeight: '400',
		fontSize: '10px',
  },
};

export const Fonts = {
  Heading1: style(FontsRaw.Heading1),
  BodyDefault: style(FontsRaw.BodyDefault),
  BodySmallRegular: style(FontsRaw.BodySmallRegular),
	BodyXSmallRegular: style(FontsRaw.BodyXSmallRegular),
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
