import { useState, useEffect, useCallback } from 'react';

import type { Changeset, Repository } from '../../types/state';
import SearchInput from './SearchInput';
import SearchResultsList from './SearchResultsList';

interface Props {
  compact: boolean;
  inputPlaceholder: string;
  searchResults: Changeset[];
  displayedRevisions: Changeset[];
  searchType: 'base' | 'new';
  repository: Repository['name'];
  onSearchResultsToggle: (item: Changeset) => void;
}

export default function SearchInputAndResults({
  compact,
  inputPlaceholder,
  searchResults,
  displayedRevisions,
  searchType,
  repository,
  onSearchResultsToggle,
}: Props) {
  const [displayDropdown, setDisplayDropdown] = useState(false);

  const handleDocumentMousedown = useCallback(
    (e: MouseEvent) => {
      if (!displayDropdown) {
        return;
      }
      const target = e.target as HTMLElement;
      if (target.closest(`.${searchType}-search-input`) === null) {
        // Close the dropdown only if the click is outside the search input or one
        // of it's descendants.
        setDisplayDropdown(false);
      }
    },
    [displayDropdown],
  );

  const handleEscKeypress = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setDisplayDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleDocumentMousedown);
    return () => {
      document.removeEventListener('mousedown', handleDocumentMousedown);
    };
  }, [handleDocumentMousedown]);

  useEffect(() => {
    document.addEventListener('keydown', handleEscKeypress);
    return () => {
      document.removeEventListener('keydown', handleEscKeypress);
    };
  }, []);

  return (
    <>
      <SearchInput
        onFocus={() => setDisplayDropdown(true)}
        compact={compact}
        inputPlaceholder={inputPlaceholder}
        searchType={searchType}
        repository={repository}
      />

      {searchResults.length > 0 && displayDropdown && (
        <SearchResultsList
          compact={compact}
          searchResults={searchResults}
          displayedRevisions={displayedRevisions}
          onToggle={onSearchResultsToggle}
        />
      )}
    </>
  );
}
