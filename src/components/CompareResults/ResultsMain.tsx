import { Fragment, useState } from 'react';

import { Button, Link } from '@mui/material';
import { Grid } from '@mui/material';
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
import { Colors, FontsRaw, Spacing } from '../../styles';
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
      lineHeight: '20px',
      borderLeft: '1px solid #5B5B66',
      paddingLeft: '9px',
    }),
  };

  const titleContainerSx = {
    alignItems: 'center',
    gap: '9px',
    margin: `0 0 ${Spacing.Medium}px 0`,
    maxWidth: '568px',
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

  /********** Edit Results Title Section **********/
  const [editComparisonTitleInputVisible, showEditComparisonTitle] =
    useState(false);
  const [titleError, setTitleError] = useState(false);
  const [rawSearchParams, updateRawSearchParams] = useRawSearchParams();
  const initialComparisonTitle = rawSearchParams.get('title') ?? '';
  const [comparisonTitleName, setComparisonTitleName] = useState(
    initialComparisonTitle,
  );

  const handleEditInputToggle = () => {
    showEditComparisonTitle(!editComparisonTitleInputVisible);
  };

  const slugifyComparisonTitle = (title: string) => {
    title
      /**
       *please see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize#examples
       */
      .normalize('NFD') // Normalize to decompose diacritics (e.g., é -> e)
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Convert non-alphanumeric to hyphen
      .replace(/^-+|-+$/g, ''); // Trim hyphens from start and end
    return title;
  };

  const onComparisonTitleChange = (value: string) => {
    setComparisonTitleName(value);
    if (comparisonTitleName) {
      const slug = slugifyComparisonTitle(comparisonTitleName);
      rawSearchParams.set('title', slug);
    } else {
      rawSearchParams.delete('title');
    }
  };

  const OnComparisonTitleSave = () => {
    if (comparisonTitleName) {
      updateRawSearchParams(rawSearchParams);
      showEditComparisonTitle(!editComparisonTitleInputVisible);
    }
    setTitleError(true);
  };

  const deSlugify = (slug: string | undefined) => {
    if (!slug) return '';
    return slug
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const deSlugifiedTitle = deSlugify(comparisonTitleName);

  const renderEditSaveCancelBtns = () => {
    return (
      <>
        {editComparisonTitleInputVisible ? (
          <>
            <Button
              name='cancel-title'
              aria-label='cancel title'
              className='cancel-btn'
              variant='text'
              onClick={handleEditInputToggle}
            >
              Cancel
            </Button>
            <Button
              name='save-title'
              aria-label='save title'
              className='save-btn'
              variant='text'
              onClick={OnComparisonTitleSave}
            >
              Save
            </Button>
          </>
        ) : (
          <Button
            name='edit-title'
            aria-label='edit title'
            startIcon={buttonIcon}
            className='edit-title-btn'
            variant='text'
            onClick={handleEditInputToggle}
            sx={{ fontSize: '0.75rem' }}
          >
            Edit title
          </Button>
        )}
      </>
    );
  };

  const buttonIcon = (
    <img
      id='edit-title-icon'
      className='icon icon-edit'
      src={themeMode === 'light' ? pencil.toString() : pencilDark.toString()}
      alt='edit-icon'
    />
  );

  const titleErrorMessage = titleError ? 'Title cannot be empty' : null;

  const renderResultsTableTitleOrInput = () => {
    return (
      <>
        {editComparisonTitleInputVisible ? (
          <EditTitleInput
            titleError={titleErrorMessage}
            comparisonTitleName={deSlugifiedTitle}
            compact={true}
            onChange={onComparisonTitleChange}
          />
        ) : (
          <Grid component='h2' item className={styles.title}>
            {comparisonTitleName && !editComparisonTitleInputVisible
              ? deSlugifiedTitle
              : 'Results'}
          </Grid>
        )}

        {renderEditSaveCancelBtns()}
      </>
    );
  };

  return (
    <Container className={styles.container} data-testid='results-main'>
      <header>
        <Grid container sx={titleContainerSx}>
          {renderResultsTableTitleOrInput()}
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
