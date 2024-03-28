import { useState, useEffect, useCallback, useRef } from 'react';

import Box from '@mui/material/Box';
import { useFetcher } from 'react-router-dom';

import type { Changeset, Repository } from '../../types/state';
import SearchInput from './SearchInput';
import SearchResultsList from './SearchResultsList';

interface Props {
  compact: boolean;
  inputPlaceholder: string;
  displayedRevisions: Changeset[];
  searchType: 'base' | 'new';
  repository: Repository['name'];
  onSearchResultsToggle: (item: Changeset) => void;
}

export default function SearchInputAndResults({
  compact,
  inputPlaceholder,
  displayedRevisions,
  searchType,
  repository,
  onSearchResultsToggle,
}: Props) {
  const fetcher = useFetcher<Changeset[]>();
  const [displayDropdown, setDisplayDropdown] = useState(false);
  const containerRef = useRef(null as null | HTMLElement);

  const handleDocumentMousedown = useCallback(
    (e: MouseEvent) => {
      if (!displayDropdown) {
        return;
      }
      const target = e.target as HTMLElement;
      if (!containerRef.current?.contains(target)) {
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
    <Box ref={containerRef}>
      <SearchInput
        onFocus={() => setDisplayDropdown(true)}
        compact={compact}
        inputPlaceholder={inputPlaceholder}
        searchType={searchType}
        repository={repository}
        fetcherLoad={fetcher.load}
      />

      {fetcher.data && fetcher.data.length && displayDropdown ? (
        <SearchResultsList
          compact={compact}
          searchResults={fetcher.data}
          displayedRevisions={displayedRevisions}
          onToggle={onSearchResultsToggle}
        />
      ) : null}
    </Box>
  );
}
