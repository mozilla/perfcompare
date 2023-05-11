import { stylesheet } from 'typestyle';

import {
  Spacing,
  Colors,
  CardsDarkRaw,
  CardsLightRaw,
} from '../styles';


export const ExpandableRowStyles = (mode: string) => {
  const isTrueLight = mode == 'light' ? true : false;

  const expandedRowCSS = stylesheet({
    container: {
      ...(isTrueLight ? CardsLightRaw : CardsDarkRaw),
      width: '100%',
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      cursor: 'pointer',
      transition: 'border-radius 0.4s ease-in-out',
      $nest: {
        '&.content-row': {
          minHeight: '0',
          height: '0',
          overflow: 'hidden',
          transition: 'min-height 0.4s ease-in-out',
          cursor: 'default',
          $nest: {
            '&.content-row--expanded': {
              borderRadius: `0px 0px ${Spacing.Small}px ${Spacing.Small}px`,
              borderTop: isTrueLight
                ? Colors.Background200
                : Colors.Background200Dark,
              minHeight: '317px',
            },
          },
        },
      },
    },
  });

  return expandedRowCSS;
};

