import { useState, useEffect, useCallback, useRef } from 'react';

import Box from '@mui/material/Box';

import { fetchRecentRevisions } from '../../logic/treeherder';
import type { Changeset, Repository } from '../../types/state';
import { simpleDebounce } from '../../utils/simple-debounce';
import SearchInput from './SearchInput';
import SearchResultsList from './SearchResultsList';

interface Props {
  compact: boolean;
  inputPlaceholder: string;
  displayedRevisions: Changeset[];
  searchType: 'base' | 'new';
  repository: Repository['name'];
  onSearchResultsToggle: (item: Changeset) => void;
  listItemComponent?: 'checkbox' | 'radio';
}

export default function SearchInputAndResults({
  compact,
  inputPlaceholder,
  displayedRevisions,
  searchType,
  repository,
  onSearchResultsToggle,
  listItemComponent,
}: Props) {
  const [displayDropdown, setDisplayDropdown] = useState(false);
  const [recentRevisions, setRecentRevisions] = useState(
    null as null | Changeset[],
  );
  const [searchError, setSearchError] = useState(null as null | string);

  // The last used searchTerm is kept in a ref, so that it's possible to use it
  // in an effect when the repository prop changes. It's not stored in a state
  // because it's not used for rendering DOM.
  const lastSearchTermRef = useRef('');
  // This is used as a request id. It's incremented for each new request, and
  // is checked when the response comes back, so that an older response is
  // disregarded.
  const requestsCounterRef = useRef(0);

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

  const handleEscKeypress = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setDisplayDropdown(false);
    }
  }, []);

  const searchRecentRevisions = useCallback(
    async (searchTerm: string) => {
      // If the searchTerm doesn't look like a hash, then we assume it might be an author.
      // If it looks like a hash, then we assume it's a hash.
      // NOTE: In the future we might want to be more clever and request both
      // endpoints even when it looks like a hash. For example a request such as "ade" could
      // return results for an author named "adenot" _and_  results for a hash "ade821ac".
      // In that case it would be better to show the results for the author.
      const authorInfoMatch = /[^0-9a-fA-F]/;

      // Reset various states
      setSearchError(null);
      lastSearchTermRef.current = '';

      // By increasing the counter, we ensure that responses for inflight requests will be ignored.
      const thisRequestId = ++requestsCounterRef.current;

      let searchParameters;
      if (!searchTerm) {
        searchParameters = { repository };
      } else if (authorInfoMatch.test(searchTerm)) {
        searchParameters = { repository, author: searchTerm };
      } else {
        searchParameters = { repository, hash: searchTerm };
      }

      // Keep the current searchTerm in ref so that we can use it when the
      // repository information changes.
      lastSearchTermRef.current = searchTerm;

      try {
        const results = await fetchRecentRevisions(searchParameters);
        if (thisRequestId !== requestsCounterRef.current) {
          // The user edited the text since the request started.
          // Let's ignore the result then.
          return;
        }
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
    },
    [repository],
  );

  const debouncedSearchRecentRevisions = useCallback(
    simpleDebounce(searchRecentRevisions),
    [searchRecentRevisions],
  );

  const onValueChange = (searchTerm: string) => {
    // Reset various states
    setSearchError(null);
    setRecentRevisions(null);
    debouncedSearchRecentRevisions(searchTerm);
  };

  // At load time and everytime the repository information changes, the recent
  // revisions are fetched again. It's useful so that the dropdown is shown
  // right away when focusing the input.
  useEffect(() => {
    void searchRecentRevisions(lastSearchTermRef.current);
  }, [repository]);

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
  }, [handleEscKeypress]);

  return (
    <Box ref={containerRef}>
      <SearchInput
        onFocus={() => setDisplayDropdown(true)}
        compact={compact}
        inputPlaceholder={inputPlaceholder}
        searchType={searchType}
        searchError={searchError}
        onChange={onValueChange}
      />

      {recentRevisions && displayDropdown && (
        <SearchResultsList
          compact={compact}
          searchResults={recentRevisions}
          displayedRevisions={displayedRevisions}
          onToggle={onSearchResultsToggle}
          listItemComponent={listItemComponent}
        />
      )}
    </Box>
  );
}
