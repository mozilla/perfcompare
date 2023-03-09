/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { style } from 'typestyle';

import { Colors } from './Colors';

const sharedFontStyles = {
 fontStyle: 'normal',
 color: Colors.PrimaryText,
};

const sharedFontStylesDark = {
	fontStyle: 'normal',
	color: Colors.ColorWhite,
 };

 //fontFamily: 'SF Pro',
export const FontsRaw = {
  HeadingDefault: {
    lineHeight: '22px',
		fontWeight: '600',
		fontSize: '17px',
  },

	//fontFamily: 'Metropolis',
	HeadingXS: {
		lineHeight: '28px',
		fontWeight: '700',
		fontSize: '24px',
	},

	//fontFamily: 'SF Pro',
  BodyDefault: {
		lineHeight: '16px',
		fontWeight: '400',
		fontSize: '14px',
  },

	//fontFamily: 'SF Pro',
  BodySmall: {
    lineHeight: '14px',
		fontWeight: '400',
		fontSize: '12px',
  },

	//fontFamily: 'SF Pro'
	HeadingDefaultDark: {
    lineHeight: '22px',
		fontWeight: '600',
		fontSize: '17px',
  },

	//fontFamily: 'Metropolis',
	HeadingXSDark: {
		lineHeight: '28px',
		fontWeight: '700',
		fontSize: '24px',
	
	},

	//fontFamily: 'SF Pro',
  BodyDefaultDark: {
		lineHeight: '16px',
		fontWeight: '400',
		fontSize: '14px',
		
  },

	//fontFamily: 'SF Pro',
  BodySmallDark: {
    lineHeight: '14px',
		fontWeight: '400',
		fontSize: '12px',
  },
};

export const Fonts = {
  HeadingDefault: style(FontsRaw.HeadingDefault, sharedFontStyles),
  HeadingXS: style(FontsRaw.HeadingXS, sharedFontStyles),
  BodyDefault: style(FontsRaw.BodyDefault, sharedFontStyles),
	BodySmall: style(FontsRaw.BodySmall, sharedFontStyles),
	HeadingDefaultDark: style(FontsRaw.HeadingDefaultDark, sharedFontStylesDark),
  HeadingXSDark: style(FontsRaw.HeadingXSDark, sharedFontStylesDark),
  BodyDefaultDark: style(FontsRaw.BodyDefaultDark, sharedFontStylesDark),
	BodySmallDark: style(FontsRaw.BodySmallDark, sharedFontStylesDark),
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
