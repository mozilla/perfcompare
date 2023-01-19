import type { Repository, Revision } from '../types/state';

const truncateHash = (revision: Revision['revision']) => revision.slice(0, 12);

// return only most recent commit message
// first commit is usually 'try_task_config'
const getLatestCommitMessage = (item: Revision) =>
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
  revision: Revision['revision'],
  repository: Repository['name'],
) =>
  `https://treeherder.mozilla.org/jobs?repo=${repository}&revision=${revision}`;

const setPlatformClassName = (platformName: string) => {
  if (platformName.toLowerCase().includes('linux')) return 'linux';
  else if (
    platformName.toLowerCase().includes('osx') ||
    platformName.toLowerCase().includes('os x')
  )
    return 'osx';
  else if (platformName.toLowerCase().includes('windows')) return 'windows';
  else if (platformName.toLowerCase().includes('android')) return 'android';
  else return '';
};

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
  setPlatformClassName,
  swapArrayElements,
  truncateHash,
};
