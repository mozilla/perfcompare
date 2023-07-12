import { stylesheet } from 'typestyle';

import {
  Spacing,
} from '../styles';


export const ExpandableRowStyles = () => {

  const expandedRowCSS = stylesheet({
    container: {
      width: '100%',
      display: 'none',
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
              display: 'flex',
              minHeight: '200px',
              height: '100%',
            },
          },
        },
      },
    },
  });

  return expandedRowCSS;
};
