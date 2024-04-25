import { useState, useEffect, useCallback, useRef } from 'react';

import Box from '@mui/material/Box';

import { fetchRecentRevisions } from '../../logic/treeherder';
import { Strings } from '../../resources/Strings';
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
  const [displayDropdown, setDisplayDropdown] = useState(false);
  const [recentRevisions, setRecentRevisions] = useState(
    null as null | Changeset[],
  );
  const [searchError, setSearchError] = useState(null as null | string);
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

  const searchRecentRevisions = async (searchTerm: string) => {
    const emailMatch = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const longHashMatch = /\b[a-f0-9]{40}\b/;
    const shortHashMatch = /\b[a-f0-9]{12}\b/;

    setSearchError(null);
    let searchParameters;
    if (!searchTerm) {
      searchParameters = { repository };
    } else if (emailMatch.test(searchTerm)) {
      searchParameters = { repository, author: searchTerm };
    } else if (
      longHashMatch.test(searchTerm) ||
      shortHashMatch.test(searchTerm)
    ) {
      searchParameters = { repository, hash: searchTerm };
    } else {
      setSearchError(Strings.errors.warningText);
      setRecentRevisions(null);
      return;
    }

    try {
      const results = await fetchRecentRevisions(searchParameters);
      if (results.length) {
        setRecentRevisions(results);
      } else {
        setSearchError('No results found');
        setRecentRevisions(null);
      }
    } catch (e) {
      console.error('Error while fetching recent revisions:', e);
      const strError =
        typeof e === 'string'
          ? e
          : e instanceof Error
          ? e.message
          : `Unknown error: ${String(e)}`;
      setSearchError(strError || 'An error has occurred');
      setRecentRevisions(null);
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
        searchError={searchError}
      />

      {recentRevisions && displayDropdown && (
        <SearchResultsList
          compact={compact}
          searchResults={recentRevisions}
          displayedRevisions={displayedRevisions}
          onToggle={onSearchResultsToggle}
        />
      )}
    </Box>
  );
}
