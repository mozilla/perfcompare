import React from 'react';

import { useDispatch } from 'react-redux';

import { clearCheckedRevisions } from '../reducers/CheckedRevisions';

// useFocusInput is a hook for event handlers that detect when
// a user clicks outside the input, and hides the results,
// focuses the input or clicks the search results and does not
// hide the results, and cancels the parent event handlers using
// stopPropagation()
const useFocusInput = () => {
  const [focused, setFocused] = React.useState(false);
  const dispatch = useDispatch();

  const handleParentClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).id === 'search-revision-input') {
      setFocused(true);
    } else {
      setFocused(false);
      // clear checked revisions when click outside input or results
      dispatch(clearCheckedRevisions());
    }
  };

  const handleFocus = (e: React.FocusEvent) => {
    e.stopPropagation();
    setFocused(true);
  };

  const handleChildClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFocused(true);
  };

  const handleEscKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      setFocused(false);
    }
  };

  return {
    focused,
    handleParentClick,
    handleFocus,
    handleChildClick,
    handleEscKey,
  };
};

export default useFocusInput;
