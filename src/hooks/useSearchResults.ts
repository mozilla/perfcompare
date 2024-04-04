import { VariantType, useSnackbar } from 'notistack';

import type { Changeset } from '../types/state';

const useSearchResults = () => {
  const { enqueueSnackbar } = useSnackbar();
  const handleItemToggleInChangesetList = ({
    item,
    changesets,
  }: {
    item: Changeset;
    changesets: Changeset[];
  }) => {
    // Warning: `item` isn't always the same object than the one in
    // `changesets`, therefore we need to compare the id. This happens when the
    // data in `changesets` comes from the loader, but `item` comes from the
    // search results.
    const indexInCheckedChangesets = changesets.findIndex(
      (rev) => rev.id === item.id,
    );
    const isChecked = indexInCheckedChangesets >= 0;
    const newChecked = [...changesets];

    // if item is not already checked, add to checked
    if (!isChecked) {
      newChecked.push(item);
    } else if (isChecked) {
      // if item is already checked, remove from checked
      newChecked.splice(indexInCheckedChangesets, 1);
    }

    return newChecked;
  };

  const handleRemoveNewRevision = (
    item: Changeset,
    newInProgressRevs: Changeset[],
  ) => {
    // Currently item seems to be the same object than the one stored in
    // newInProgressRevs, but it might change in the future. That's why we're
    // comparing the ids instead of using indexOf directly.
    const indexInNewChangesets = newInProgressRevs.findIndex(
      (rev) => rev.id === item.id,
    );
    const revisionsNew = [...newInProgressRevs];
    revisionsNew.splice(indexInNewChangesets, 1);
    return revisionsNew;
  };

  const isMaxRevisions = (checkedRevs: Changeset[]) => {
    const maxRevisions = 3;
    if (checkedRevs.length > maxRevisions) {
      const variant: VariantType = 'warning';
      enqueueSnackbar(`Maximum ${maxRevisions} revisions.`, { variant });
      return true;
    }
    return false;
  };

  return {
    handleRemoveNewRevision,
    handleItemToggleInChangesetList,
    isMaxRevisions,
  };
};

export default useSearchResults;
