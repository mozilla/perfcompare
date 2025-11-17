import {
  frameworkMap,
  devToolsFramework,
  baseDocsURL,
  removedOldTestDevTools,
  nonDocumentedTestsDevTools,
  supportedPerfdocsFrameworks,
} from '../common/constants';
import type { Repository, Changeset } from '../types/state';
import type { Framework, SupportedPerfdocsFramework } from '../types/types';

const truncateHash = (revision: Changeset['revision']) => revision.slice(0, 12);

// return only most recent commit message
// first commit is usually 'try_task_config'
const getLatestCommitMessage = (item: Changeset) => {
  const { repository_id: repositoryId, revisions } = item;
  const isTry = repositoryId === 4;
  const lastUsefulRevision =
    isTry && revisions.length > 1 ? revisions[1] : revisions[0];
  const lastUsefulSummary = lastUsefulRevision.comments.slice(
    0,
    lastUsefulRevision.comments.indexOf('\n'),
  );
  return lastUsefulSummary;
};

// ensure all numbers display two digits
const formatNumber = (number: number): string => {
  if (number < 10) {
    return `0${number}`;
  } else return String(number);
};

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = String(date.getFullYear()).slice(2);
  const hours = date.getHours();
  const minutes = date.getMinutes();

  return `${formatNumber(month)}/${formatNumber(day)}/${year} ${formatNumber(
    hours,
  )}:${formatNumber(minutes)}`;
};

const getTreeherderURL = (
  revision: Changeset['revision'],
  repository: Repository['name'],
) =>
  `https://treeherder.mozilla.org/jobs?repo=${repository}&revision=${revision}`;

const createDevtoolsDocsUrl = (
  supportedFramework: string,
  urlReadySuite: string,
  suite: string,
) => {
  let linkSupported = true;

  let devtoolsDocsURL = `${baseDocsURL}/devtools/tests/${supportedFramework}.html#${urlReadySuite}`;
  if (
    suite === removedOldTestDevTools ||
    nonDocumentedTestsDevTools.includes(suite)
  ) {
    devtoolsDocsURL = '';
    linkSupported = false;
  }
  return { devtoolsDocsURL, linkSupported };
};

const getDocsURL = (suite: string, framework_id: Framework['id']) => {
  const framework = frameworkMap[framework_id];
  const supportedFramework =
    supportedPerfdocsFrameworks[framework as SupportedPerfdocsFramework];
  const urlReadySuite = suite.replace(/:|\s|\.|_/g, '-').toLowerCase();

  let docsURL = '';
  let isLinkSupported = true;

  if (framework_id === devToolsFramework.id) {
    const { devtoolsDocsURL, linkSupported } = createDevtoolsDocsUrl(
      supportedFramework,
      urlReadySuite,
      suite,
    );

    isLinkSupported = linkSupported;
    docsURL = devtoolsDocsURL;
  } else if (supportedFramework) {
    docsURL = `${baseDocsURL}/testing/perfdocs/${supportedFramework}.html#${urlReadySuite}`;
  } else {
    isLinkSupported = false;
  }
  return { docsURL, isLinkSupported };
};

// TO DO: Review if this method is still needed
const setConfidenceClassName = (confidenceText: string | null) => {
  return confidenceText || 'unknown-confidence';
};

const swapArrayElements = <T>(
  array: T[],
  index1: number,
  index2: number,
): T[] => {
  if (
    index1 !== index2 &&
    [index1, index2].every((index) => index < array.length && index >= 0)
  ) {
    const newArray = [...array];
    [newArray[index1], newArray[index2]] = [newArray[index2], newArray[index1]];
    return newArray;
  }
  return array;
};

// Mode interpretation base on mode counts
const getModeInterpretation = (
  baseModeCount: number | null,
  newModeCount: number | null,
) => {
  const interpretModeCount = (modeCount: number | null) => {
    if (!modeCount) return 'N/A';
    if (modeCount === 1) return 'unimodal';
    if (modeCount > 1) return 'multimodal';
    return 'N/A';
  };
  if (
    (!baseModeCount && !newModeCount) ||
    (baseModeCount === 0 && newModeCount === 0) ||
    (!baseModeCount && newModeCount === 0) ||
    (baseModeCount === 0 && !newModeCount)
  )
    return 'No modes or data for Base and New, possible oversmoothing, KDE evaluation failed';
  if (baseModeCount && newModeCount && baseModeCount === newModeCount)
    return `Base and New revisions are ${interpretModeCount(baseModeCount)}`;
  else {
    return `Base is ${interpretModeCount(baseModeCount)} and New is ${interpretModeCount(newModeCount)}`;
  }
};

const capitalize = (str: string) => {
  if (str === '') return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const cliffsDeltaPercentage = (cliffs_delta: number) => {
  return (((cliffs_delta + 1) / 2) * 100).toFixed(2);
};

export {
  formatDate,
  getLatestCommitMessage,
  getTreeherderURL,
  setConfidenceClassName,
  swapArrayElements,
  truncateHash,
  getDocsURL,
  getModeInterpretation,
  capitalize,
  cliffsDeltaPercentage,
};
