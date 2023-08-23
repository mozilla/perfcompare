import AppleIcon from '@mui/icons-material/Apple';

import {
  frameworkMap,
  devToolsFramework,
  baseDocsURL,
  removedOldTestDevTools,
  nonDocumentedTestsDevTools,
} from '../common/constants';
import { supportedPerfdocsFrameworks } from '../common/constants';
import AndroidIcon from '../components/Shared/Icons/AndroidIcon';
import LinuxIcon from '../components/Shared/Icons/LinuxIcon';
import WindowsIcon from '../components/Shared/Icons/WindowsIcon';
import type { Repository, RevisionsList } from '../types/state';
import { Framework, SupportedPerfdocsFramework } from '../types/types';

const truncateHash = (revision: RevisionsList['revision']) =>
  revision.slice(0, 12);

// return only most recent commit message
// first commit is usually 'try_task_config'
const getLatestCommitMessage = (item: RevisionsList) =>
  item.revisions[item.revisions.length - 1].comments;

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
  revision: RevisionsList['revision'],
  repository: Repository['name'],
) =>
  `https://treeherder.mozilla.org/jobs?repo=${repository}&revision=${revision}`;

const getPlatformInfo = (platformName: string) => {
  if (platformName.toLowerCase().includes('linux'))
    return { shortName: 'Linux', icon: LinuxIcon };
  else if (
    platformName.toLowerCase().includes('osx') ||
    platformName.toLowerCase().includes('os x')
  )
    return { shortName: 'OSX', icon: AppleIcon };
  else if (platformName.toLowerCase().includes('windows'))
    return { shortName: 'Windows', icon: WindowsIcon };
  else if (platformName.toLowerCase().includes('android'))
    return { shortName: 'Android', icon: AndroidIcon };
  else return { shortName: '', icon: {} };
};

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

  const isDevToolsFramework = framework_id === devToolsFramework.id;

  if (isDevToolsFramework) {
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

export {
  formatDate,
  getLatestCommitMessage,
  getTreeherderURL,
  setConfidenceClassName,
  getPlatformInfo,
  swapArrayElements,
  truncateHash,
  getDocsURL,
};
