/* eslint-disable @typescript-eslint/no-duplicate-enum-values */
export enum Colors {
  //button colors light theme
  PrimaryDefault = '#0060df',
  PrimaryHover = '#0250bb',
  PrimaryActive = '#054096',
  PrimaryDisabled = '#0060df 40%',
  SecondaryDefault = '#f0f0f4',
  SecondaryHover = '#e0e0e6',
  SecondaryActive = '#cfcfd8',
  SecondaryDisabled = '#f0f0f4 40%',

  //button colors dark theme
  PrimaryDark = '#00ddff',
  PrimaryActiveDark = '#aaf2ff',
  PrimaryHoverDark = '#80ebff',
  PrimaryDisabledDark = '#aaf2ff 40%',
  SecondaryDark = '#2b2a33',
  SecondaryHoverDark = '#52525e',
  SecondaryActiveDark = '#5b5b66',
  SecondaryDisabledDark = '#2b2a33 40%',

  //Text colors light theme
  PrimaryText = '#15141A',
  SecondaryText = '#5B5B66',
  InvertedText = '#FBFBFE',
  LinkText = '#0060df',
  TextDisabled = '#15141a 40%',
  Normal = '#111111',

  //Text colors dark theme
  PrimaryTextDark = '#FBFBFE',
  SecondaryTextDark = '#cfcfd8',
  InvertedTextDark = '#15141a',
  LinkTextDark = '#00ddff',
  TextDisabledDark = '#fbfbfe',

  //icon colors light theme
  DefaultIcon = '#5b5b66',
  WarningIcon = '#ffa436',

  //icon colors light theme
  DefaultIconDark = '#fbfbfe',
  WarningIconDark = '#ffbd4f',

  //background colors light theme
  Background100 = '#f0f0f4',
  Background200 = '#f9f9fb',
  Background300 = '#ffffff',
  Background400 = '#FFE8E8',
  Background500 = '#D8EEDC',
  BackgroundScrim = '#5b5b66 40%',

  //background colors dark theme
  Background100Dark = '#1c1b22',
  Background200Dark = '#2b2a33',
  Background300Dark = '#42414d',
  Background400Dark = '#690F22',
  Background500Dark = '#004725',
  BackgroundScrimDark = '#5b5b66 45%',

  //border colors light theme
  BorderDefault = '#8F8F9D',
  BorderDropdownMenu = '#CFCFD8',
  BorderZap = 'linear-gradient(90deg, #9059FF 0%, #FF4AA2 52.08%, #FFBD4F 100%)',

  //border colors dark theme
  BorderDefaultDark = '#8f8f9e',
  BorderZapDark = 'linear-gradient(90deg, #9059FF 0%, #FF4AA2 52.08%, #FFBD4F 100%);',

  //shadow colors light theme
  ShadowLight = '0px 2px 6px rgba(58, 57, 68, 0.2)',

  //shadow colors dark theme
  ShadowDark = '0px 2px 6px #15141A',

  ColorTransparent = 'transparent',
  ColorBlack = '#000000',

  //banner color
  BannerBG = 'rgb(255, 244, 229)',

  //icon light
  IconLight = '#5B5B66',
  IconLightSecondary = '#FBFBFE',
  IconLightSuccess = '#017A40',
  IconLightError = '#D7264C',

  //icon dark
  IconDark = '#FBFBFE',
  IconDarkSuccess = '#4DBC87',
  IconDarkError = '#F37F98',

  // Colors for the base and new charts
  // Note that they need to be using the hash notation so that they work in all
  // places they're used
  ChartBase = '#9059ff',
  ChartNew = '#008787',
}

export const background = (mode: string) => {
  return mode === 'light' ? Colors.Background300 : Colors.Background100Dark;
};
