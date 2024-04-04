import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ChangeEvent,
} from 'react';

import Box from '@mui/material/Box';
import { useFetcher } from 'react-router-dom';

import useIdleChange from '../../hooks/useIdleChange';
import { Strings } from '../../resources/Strings';
import type { Changeset, Repository } from '../../types/state';
import type { LoaderReturnValue } from './loader';
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
  const fetcher = useFetcher<LoaderReturnValue>();
  const [displayDropdown, setDisplayDropdown] = useState(false);
  const containerRef = useRef(null as null | HTMLElement);
  const [inputError, setInputError] = useState('');

  const searchRecentRevisions = (searchTerm: string) => {
    const emailMatch = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const hashMatch = /^[a-f0-9]+$/i;

    let apiUrl = `/api/recent-revisions/${repository}`;

    if (emailMatch.test(searchTerm)) {
      apiUrl += '/by-author/' + encodeURIComponent(searchTerm);
    } else if (hashMatch.test(searchTerm)) {
      apiUrl += '/by-hash/' + encodeURIComponent(searchTerm);
    } else if (searchTerm) {
      setInputError(Strings.errors.warningText);
      return;
    }

    fetcher.load(apiUrl);
  };

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

  const onValueChangeAfterTimeout = (searchTerm: string) => {
    searchRecentRevisions(searchTerm);
  };

  const { onIdleChange } = useIdleChange(onValueChangeAfterTimeout);

  const onValueChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputError('');
    onIdleChange(e);
  };

  const onFocus = (searchTerm: string) => {
    setDisplayDropdown(true);
    searchRecentRevisions(searchTerm);
  };

  const fetcherError = fetcher.data?.error;
  const errorText = inputError ?? fetcherError ?? null;

  return (
    <Box ref={containerRef}>
      <SearchInput
        compact={compact}
        inputPlaceholder={inputPlaceholder}
        searchType={searchType}
        errorText={errorText}
        onFocus={onFocus}
        onChange={onValueChange}
      />

      {fetcher.data?.results && !errorText && displayDropdown ? (
        <SearchResultsList
          compact={compact}
          searchResults={fetcher.data.results}
          displayedRevisions={displayedRevisions}
          onToggle={onSearchResultsToggle}
        />
      ) : null}
    </Box>
  );
}
