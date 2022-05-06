import React from 'react';

// useFocusInput is a hook for event handlers that detect when
// a user clicks outside the input, and hides the results,
// focuses the input or clicks the search results and does not
// hide the results, and cancels the parent event handlers using
// stopPropagation()
const useFocusInput = () => {
  const [focused, setFocused] = React.useState(false);

  const handleParentClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).id === 'search-revision-input') {
      setFocused(true);
    } else {
      setFocused(false);
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

  return { focused, handleParentClick, handleFocus, handleChildClick };
};

export default useFocusInput;
