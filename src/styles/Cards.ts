import { style } from 'typestyle';

import { Colors } from './Colors';
import { Spacing } from './Spacing';


export const CardsLightRaw = {
  boxShadow: Colors.ShadowLight,
  backgroundColor: Colors.Background300,
  borderRadius: Spacing.Small,
};

export const CardsDarkRaw = {
  boxShadow: Colors.ShadowDark,
  backgroundColor: Colors.Background300Dark,
  borderRadius: Spacing.Small,
};

export const SearchCardsRawShared = {
  display: 'flex',
  flexDirection: 'row',
  cursor: 'pointer',
  justifyContent: 'space-between',
  width: '100%',
};

export const CardsLight = style(CardsLightRaw);
export const CardsDark = style(CardsDarkRaw);