import { useEffect, useState } from 'react';

import Grid from '@mui/material/Grid';
import { useLoaderData } from 'react-router-dom';
import { style } from 'typestyle';

import type { LoaderReturnValue } from './loader';
import ResultsMain from './ResultsMain';
import { useAppSelector } from '../../hooks/app';
import useRawSearchParams from '../../hooks/useRawSearchParams';
import { SearchContainerStyles, background } from '../../styles';
import CompareWithBase from '../Search/CompareWithBase';
import { LinkToHome } from '../Shared/LinkToHome';
import PerfCompareHeader from '../Shared/PerfCompareHeader';

interface ResultsViewProps {
  title: string;
}
function ResultsView(props: ResultsViewProps) {
  const { baseRevInfo, newRevsInfo, frameworkId, baseRepo, newRepos } =
    useLoaderData() as LoaderReturnValue;

  const newRepo = newRepos[0];
  const { title } = props;
  const themeMode = useAppSelector((state) => state.theme.mode);
  const styles = {
    container: style({
      backgroundColor: background(themeMode),
    }),
  };

  const sectionStyles = SearchContainerStyles(themeMode, /* isHome */ false);
  const [rawSearchParams, updateRawSearchParams] = useRawSearchParams();
  const [editComparisonTitleInputVisible, showEditComparisonTitle] =
    useState(false);
  const initialComparisonTitle = rawSearchParams.get('title') ?? '';
  const [comparisonTitleName, setComparisonTitleName] = useState(
    initialComparisonTitle,
  );
  const [titleError, setTitleError] = useState(false);

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

  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div
      className={styles.container}
      data-testid='beta-version-compare-results'
    >
      <PerfCompareHeader
        handleShowInput={handleEditInputToggle}
        editComparisonTitleInputVisible={editComparisonTitleInputVisible}
        onChange={onComparisonTitleChange}
        onSave={OnComparisonTitleSave}
        comparisonTitleName={comparisonTitleName}
        titleError={titleError}
      />

      <section className={sectionStyles.container}>
        <LinkToHome />
        <CompareWithBase
          hasEditButton={true}
          baseRev={baseRevInfo ?? null}
          newRevs={newRevsInfo ?? []}
          frameworkIdVal={frameworkId}
          isExpanded={true}
          baseRepo={baseRepo}
          newRepo={newRepo}
        />
      </section>

      <Grid container alignItems='center' justifyContent='center'>
        <Grid item xs={12}>
          <ResultsMain />
        </Grid>
      </Grid>
    </div>
  );
}

export default ResultsView;
