import { style } from 'typestyle';

import { Colors } from './Colors';
import { Spacing } from './Spacing';

const padding = Spacing.Small;

export const SelectListLight = style({
	backgroundColor: Colors.Background300,
	border: `1px solid ${Colors.BorderDefault}`,
	padding,
});

export const SelectListDark = style({
	backgroundColor: Colors.Background300Dark,
	border: `1px solid ${Colors.BorderDefault}`,
	padding,
});