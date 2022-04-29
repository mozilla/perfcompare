const truncateHash = (item) => item.revision.slice(0, 11);

const getLastRevision = (item) => item.revisions[item.revisions.length - 1];

export { truncateHash, getLastRevision };
