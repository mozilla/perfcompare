import type { Revision } from '../types/state';

const truncateHash = (revision: Revision['revision']) => revision.slice(0, 12);

// return only most recent commit message
// first commit is usually 'try_task_config'
const getLatestCommitMessage = (item: Revision) =>
  item.revisions[item.revisions.length - 1].comments;

export { truncateHash, getLatestCommitMessage };
