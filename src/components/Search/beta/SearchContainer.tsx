import Typography from '@mui/material/Typography';
import { style } from 'typestyle';

import { Strings } from '../../../resources/Strings';
import {
  FontsRaw,
  Spacing,
  CardsLightRaw,
  CardsDarkRaw,
  Colors,
} from '../../../styles';
import CompareOverTime from './CompareOverTime';
import CompareWithBase from './CompareWithBase';

const strings = Strings.components.searchDefault;

function SearchContainer(props: SearchViewProps) {
  const { themeMode } = props;

  const styles = {
    container: style({
      maxWidth: '810px',
      marginTop: `${Spacing.layoutLarge + 20}px`,
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'center',
      flexDirection: 'column',
      $nest: {
        '.search-default-title': {
          ...(themeMode === 'light'
            ? FontsRaw.HeadingXS
            : FontsRaw.HeadingXSDark),
          marginBottom: `${Spacing.xLarge + 10}px`,
          textAlign: 'center',
        },
        '.compare-card-container': {
          ...(themeMode === 'light' ? CardsLightRaw : CardsDarkRaw),
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          cursor: 'pointer',
          justifyContent: 'space-between',
          $nest: {
            '&--time': {
              marginTop: `${Spacing.Large}px`,
              marginBottom: `${Spacing.layoutLarge + 20}px`,
            },
            '.compare-card-text': {
              paddingLeft: `${Spacing.xxLarge}px`,
              paddingTop: `${Spacing.xxLarge + 8}px`,
              paddingBottom: `${Spacing.xxLarge + 8}px`,
              paddingRight: `${Spacing.xLarge + 14}px`,
              width: '100%',
            },
            '.compare-card-title': {
              ...(themeMode === 'light'
                ? FontsRaw.HeadingDefault
                : FontsRaw.HeadingDefaultDark),
            },
            '.compare-card-tagline': {
              ...(themeMode === 'light'
                ? FontsRaw.BodyDefault
                : FontsRaw.BodyDefaultDark),
            },
            '.compare-card-img': {
              minWidth: '191px',
              borderRadius: `0px ${Spacing.Small}px ${Spacing.Small}px 0px`,
              display: 'grid',
              justifyContent: 'center',
              alignContent: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              background:
                themeMode == 'light'
                  ? Colors.Background200
                  : Colors.Background200Dark,
              $nest: {
                '&--time': {
                  backgroundImage: `url(${
                    themeMode === 'light'
                      ? strings.overTime.img
                      : strings.overTime.imgDark
                  })`,
                },
                '&--base': {
                  backgroundImage: `url(${
                    themeMode === 'light'
                      ? strings.base.img
                      : strings.base.imgDark
                  })`,
                },
              },
            },
          },
        },
      },
    }),
  };

  return (
    <section className={styles.container}>
      <Typography className='search-default-title'>{strings.title}</Typography>
      <CompareWithBase />
      <CompareOverTime />
    </section>
  );
}

interface SearchViewProps {
  themeMode: 'light' | 'dark';
}

export default SearchContainer;
