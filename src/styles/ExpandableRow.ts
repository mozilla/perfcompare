import { stylesheet } from 'typestyle';

import { Spacing } from '../styles';

export const ExpandableRowStyles = () => {
  const expandedRowCSS = stylesheet({
    container: {
      width: '100%',
      flexDirection: 'row',
      flexWrap: 'wrap',
      cursor: 'pointer',
      transition: 'border-radius 0.4s ease-in-out',
      $nest: {
        '&.content-row': {
          cursor: 'default',
          borderRadius: `0px 0px ${Spacing.Small}px ${Spacing.Small}px`,
          display: 'flex',
          minHeight: '200px',
          height: '100%',
        },
      },
    },
  });

  return expandedRowCSS;
};
