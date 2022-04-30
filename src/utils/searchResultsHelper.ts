import type { Revision } from '../types/state';

const truncateHash = (item: Revision) => item.revision.slice(0, 11);

const getLastRevision = (item: Revision) =>
  item.revisions[item.revisions.length - 1];

export { truncateHash, getLastRevision };
