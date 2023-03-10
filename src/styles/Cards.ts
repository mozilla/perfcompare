import { style } from 'typestyle';

import { Colors } from './Colors';
import { Spacing } from './Spacing';

export const Cards = {
	sharedAll: style({
		borderRadius: Spacing.Small,
	}),

	sharedLight: style({
		boxShadow: Colors.ShadowLight,
		backgroundColor: Colors.Background300,
	}),

	sharedDark: style({
		boxShadow: Colors.ShadowDark,
		backgroundColor: Colors.Background300Dark,
	}),
 };