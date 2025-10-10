import { useRef, useEffect, useState } from 'react';

import { Button, Grid } from '@mui/material';
import { Container } from '@mui/system';
import { useLoaderData } from 'react-router';
import { style } from 'typestyle';

import type { LoaderReturnValue } from './loader';
import type { LoaderReturnValue as OverTimeLoaderReturnValue } from './overTimeLoader';
import ResultsTable from './ResultsTable';
import { useAppSelector } from '../../hooks/app';
import useRawSearchParams from '../../hooks/useRawSearchParams';
import { Colors, FontsRaw, FontSizeRaw, Spacing } from '../../styles';
import pencilDark from '../../theme/img/pencil-dark.svg';
import pencil from '../../theme/img/pencil.svg';
import EditTitleInput from '../CompareResults/EditTitleInput';
import ToggleReplicatesButton from '../Shared/ToggleReplicatesButton';

type CombinedLoaderReturnValue = LoaderReturnValue | OverTimeLoaderReturnValue;

function ResultsMain() {
  const loaderData = useLoaderData<CombinedLoaderReturnValue>();

  const themeMode = useAppSelector((state) => state.theme.mode);

  const themeColor100 =
    themeMode === 'light' ? Colors.Background300 : Colors.Background100Dark;

  const styles = {
    alert: style({
      width: '100%',
      fontSize: '16px',
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
      fontSize: '16px',
      borderLeft: '1px solid #5B5B66',
      paddingLeft: '9px',
      margin: 0,
    }),
    replicates: style({
      marginRight: '10px',
    }),
  };

  const titleContainerSx = {
    alignItems: 'center',
    gap: '9px',
    margin: `0 0 ${Spacing.Medium}px 0`,
    justifyContent: 'space-between',
  };

  const titleContainerSubSx = {
    alignItems: 'center',
    gap: '9px',
  };

  const subtitles = {
    'compare-results': 'Compare with a base',
    'compare-over-time-results': 'Compare over time',
  };

  /************************************************/
  /********** Edit Results Title Section **********/
  /************************************************/
  const [rawSearchParams, updateRawSearchParams] = useRawSearchParams();
  const initialComparisonTitle = rawSearchParams.get('title') ?? 'Results';
  const [comparisonTitleName, setComparisonTitleName] = useState(
    initialComparisonTitle,
  );
  const previousComparisonTitleRef = useRef(initialComparisonTitle);
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
    <Container
      maxWidth={false}
      sx={{ maxWidth: '1300px' }}
      className={styles.container}
      data-testid='results-main'
    >
      <header>
        <Grid container sx={titleContainerSx}>
          <Grid container sx={titleContainerSubSx}>
            {editComparisonTitleInputVisible ? (
              <EditTitleInput
                refInput={editTitleInputRef}
                onChange={onComparisonTitleChange}
                onSave={onSaveButtonClick}
                onCancel={onCancelButtonClick}
                value={comparisonTitleName}
              />
            ) : (
              <>
                <Grid component='h2' className={styles.title}>
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

            <Grid component='h2' className={styles.subtitle}>
              {subtitles[loaderData.view]}
            </Grid>
          </Grid>
          <Grid component='h2' className={styles.replicates}>
            <ToggleReplicatesButton />
          </Grid>
        </Grid>
      </header>
      <ResultsTable />
    </Container>
  );
}

export default ResultsMain;


