import { Fragment, useRef, useEffect, useState } from 'react';

import { Button, Grid, Link } from '@mui/material';
import Alert from '@mui/material/Alert';
import { Container } from '@mui/system';
import { useLoaderData } from 'react-router-dom';
import { style } from 'typestyle';

import type { LoaderReturnValue } from './loader';
import type { LoaderReturnValue as OverTimeLoaderReturnValue } from './overTimeLoader';
import ResultsTable from './ResultsTable';
import { compareView } from '../../common/constants';
import { useAppSelector } from '../../hooks/app';
import useRawSearchParams from '../../hooks/useRawSearchParams';
import {
  getPerfherderCompareWithBaseViewURL,
  getPerfherderCompareOverTimeViewURL,
} from '../../logic/treeherder';
import { Colors, FontsRaw, FontSizeRaw, Spacing } from '../../styles';
import pencilDark from '../../theme/img/pencil-dark.svg';
import pencil from '../../theme/img/pencil.svg';
import { truncateHash } from '../../utils/helpers';
import EditTitleInput from '../CompareResults/EditTitleInput';

function getPunctuationMark(index: number, newRevs: string[]) {
  return index != newRevs.length - 1 ? ', ' : '.';
}

function ResultsMain() {
  const loaderData = useLoaderData() as
    | LoaderReturnValue
    | OverTimeLoaderReturnValue;

  const themeMode = useAppSelector((state) => state.theme.mode);

  const themeColor100 =
    themeMode === 'light' ? Colors.Background300 : Colors.Background100Dark;

  const { view } = useLoaderData() as
    | LoaderReturnValue
    | OverTimeLoaderReturnValue;
  const styles = {
    alert: style({
      width: '100%',
    }),
    container: style({
      backgroundColor: themeColor100,
      margin: '0 auto',
      marginBottom: '80px',
    }),
    title: style({
      ...FontsRaw.HeadingXS,
      fontWeight: 700,
      letterSpacing: '-0.01em',
      margin: 0,
    }),
    subtitle: style({
      ...FontsRaw.BodyDefault,
      fontSize: '15px',
      borderLeft: '1px solid #5B5B66',
      paddingLeft: '9px',
    }),
  };

  const titleContainerSx = {
    alignItems: 'center',
    gap: '9px',
    margin: `0 0 ${Spacing.Medium}px 0`,
  };

  const subtitles = {
    'compare-results': 'Compare with a base',
    'compare-over-time-results': 'Compare over time',
  };

  function getCompareViewURL(index: number, rev: string): string | undefined {
    if (loaderData.view === compareView) {
      const { frameworkId, baseRepo, baseRev, newRepos } = loaderData;
      return getPerfherderCompareWithBaseViewURL(
        baseRepo,
        baseRev,
        newRepos[index],
        rev,
        frameworkId,
      );
    } else {
      const { frameworkId, baseRepo, newRepos, intervalValue } = loaderData;
      return getPerfherderCompareOverTimeViewURL(
        baseRepo,
        newRepos[index],
        rev,
        frameworkId,
        intervalValue,
      );
    }
  }
  /************************************************/
  /********** Edit Results Title Section **********/
  /************************************************/
  const [rawSearchParams, updateRawSearchParams] = useRawSearchParams();
  const initialComparisonTitle = rawSearchParams.get('title') ?? 'Results';
  const [comparisonTitleName, setComparisonTitleName] = useState(
    initialComparisonTitle,
  );
  const previousComparisonTitleRef = useRef('Results');
  const editTitleInputRef = useRef<HTMLInputElement>(null);
  const [editComparisonTitleInputVisible, showEditComparisonTitleInput] =
    useState(false);

  useEffect(() => {
    if (editComparisonTitleInputVisible && editTitleInputRef.current) {
      editTitleInputRef.current.focus();
      editTitleInputRef.current.select();
    }
  }, [editComparisonTitleInputVisible]);

  const onEditButtonClick = () => {
    showEditComparisonTitleInput(true);
    previousComparisonTitleRef.current = comparisonTitleName;
  };

  const onCancelButtonClick = () => {
    showEditComparisonTitleInput(false);
    setComparisonTitleName(previousComparisonTitleRef.current);
  };

  const onComparisonTitleChange = (value: string) => {
    setComparisonTitleName(value);
  };

  const onSaveButtonClick = () => {
    rawSearchParams.set('title', comparisonTitleName);
    updateRawSearchParams(rawSearchParams);
    showEditComparisonTitleInput(false);
  };

  const buttonIcon = (
    <img
      src={themeMode === 'light' ? pencil.toString() : pencilDark.toString()}
      role='presentation'
    />
  );

  return (
    <Container className={styles.container} data-testid='results-main'>
      <header>
        <Grid container sx={titleContainerSx}>
          {editComparisonTitleInputVisible ? (
            <EditTitleInput
              refInput={editTitleInputRef}
              compact={true}
              onChange={onComparisonTitleChange}
              onSave={onSaveButtonClick}
              onCancel={onCancelButtonClick}
              value={comparisonTitleName}
            />
          ) : (
            <>
              <Grid component='h2' item className={styles.title}>
                {comparisonTitleName}
              </Grid>
              <Button
                startIcon={buttonIcon}
                variant='text'
                onClick={onEditButtonClick}
                sx={{ fontSize: FontSizeRaw.xSmall.fontSize }}
              >
                Edit title
              </Button>
            </>
          )}

          <Grid component='h2' item className={styles.subtitle}>
            {subtitles[view]}
          </Grid>
        </Grid>
        <Grid container sx={titleContainerSx}>
          <Alert severity='info' className={styles.alert}>
            Perfherder links are available for:{' '}
            {loaderData.newRevs.map((rev, index) => (
              <Fragment key={rev}>
                <Link href={getCompareViewURL(index, rev)} target='_blank'>
                  {`comparison ${truncateHash(rev)}`}
                </Link>
                {getPunctuationMark(index, loaderData.newRevs)}
              </Fragment>
            ))}
          </Alert>
        </Grid>
      </header>
      <ResultsTable />
    </Container>
  );
}

export default ResultsMain;
