import {
  useState,
  useEffect,
  useCallback,
  useRef,
  HTMLAttributes,
} from 'react';

import Autocomplete, {
  AutocompleteRenderInputParams,
} from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import { style } from 'typestyle';

import AutocompleteInput from './AutocompleteInput';
import AutocompleteOption from './AutocompleteOption';
import { useAppSelector } from '../../hooks/app';
import { fetchRecentRevisions } from '../../logic/treeherder';
import { Strings } from '../../resources/Strings';
import {
  Colors,
  FontsRaw,
  Spacing,
  captionStylesLight,
  captionStylesDark,
} from '../../styles';
import type { Changeset, Repository } from '../../types/state';
import { simpleDebounce } from '../../utils/simple-debounce';

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
  const mode = useAppSelector((state) => state.theme.mode);

  // const [displayDropdown, setDisplayDropdown] = useState(false);
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

  // Styling from original SearchResultsList
  const sharedSelectStyles = {
    borderRadius: '4px',
    marginTop: `${Spacing.xSmall}px`,
    maxHeight: '285px',
    overflow: 'auto',
    maxWidth: '100%',
    padding: `${Spacing.xSmall}px`,
    border: `1px solid ${Colors.BorderDefault}`,
    zIndex: 100,
  };

  const getListStyles = (theme: string) => {
    const backgroundColor =
      theme === 'light' ? Colors.Background300 : Colors.Background300Dark;
    const hoverColor =
      theme === 'light' ? Colors.SecondaryHover : Colors.SecondaryHoverDark;
    const activeColor =
      theme === 'light' ? Colors.SecondaryActive : Colors.SecondaryActiveDark;
    const captionStyle =
      theme === 'light' ? captionStylesLight : captionStylesDark;

    return style({
      backgroundColor,
      position: 'relative',
      ...sharedSelectStyles,
      $nest: {
        // Autocomplete option highlighting
        'li[aria-selected="true"]': {
          backgroundColor: `${hoverColor} !important`,
          borderRadius: '4px',
          paddingTop: `${Spacing.xSmall}px`,
        },
        'li:hover': {
          backgroundColor: `${hoverColor} !important`,
          borderRadius: '4px',
          paddingTop: `${Spacing.xSmall}px`,
        },
        'li[data-focus="true"]': {
          backgroundColor: `${hoverColor} !important`,
          borderRadius: '4px',
          paddingTop: `${Spacing.xSmall}px`,
        },
        'li.Mui-focused': {
          backgroundColor: `${hoverColor} !important`,
          borderRadius: '4px',
          paddingTop: `${Spacing.xSmall}px`,
        },
        // General li styling for all options
        li: {
          paddingTop: `${Spacing.xSmall}px`,
        },
        // Original list item button styles (keeping for compatibility)
        '.MuiListItemButton-root': {
          padding: `${Spacing.xSmall}px ${Spacing.Small}px`,
          $nest: {
            '&:hover': {
              backgroundColor: hoverColor,
              borderRadius: '4px',
            },
            '&:active': {
              backgroundColor: activeColor,
              borderRadius: '4px',
            },
          },
        },
        '.item-selected': {
          backgroundColor: hoverColor,
          borderRadius: '4px',
        },
        '.revision-hash': {
          ...FontsRaw.BodyDefault,
          marginRight: Spacing.Small,
        },
        '.info-caption': {
          ...captionStyle,
        },
        '.MuiTypography-root': {
          ...FontsRaw.BodyDefault,
        },
      },
    });
  };

  // const handleDocumentMousedown = useCallback(
  //   (e: MouseEvent) => {
  //     if (!displayDropdown) {
  //       return;
  //     }
  //     const target = e.target as HTMLElement;
  //     if (!containerRef.current?.contains(target)) {
  //       // Close the dropdown only if the click is outside the search input or one
  //       // of it's descendants.
  //       setDisplayDropdown(false);
  //     }
  //   },
  //   [displayDropdown],
  // );

  // const handleEscKeypress = useCallback((e: KeyboardEvent) => {
  //   if (e.key === 'Escape') {
  //     setDisplayDropdown(false);
  //   }
  // }, []);

  const searchRecentRevisions = useCallback(
    async (searchTerm: string) => {
      // If the URL has a parameter useFulltextSearch, use it to determine the search type.
      const urlParams = new URLSearchParams(window.location.search);
      const useFulltextSearch = urlParams.has('useFulltextSearch');
      // The search input must be at least three characters.
      // If the input matches a hash pattern (4-40 hex characters with at least one letter), treat it as a hash.

      // Otherwise, assume it's an author name, email, bug number, or comment and pass it as a general search term.
      // NOTE: In the future we might want to be more clever and request both
      // endpoints even when it looks like a hash. For example a request such as "ade" could
      // return results for an author named "adenot" _and_  results for a hash "ade821ac".
      // In that case it would be better to show the results for the author.

      const isHash = /^(?=.*[a-f])[a-f0-9]{4,40}$/i;
      const authorInfoMatch = /[^0-9a-fA-F]/;

      // Reset various states
      setSearchError(null);
      lastSearchTermRef.current = '';

      // By increasing the counter, we ensure that responses for inflight requests will be ignored.
      const thisRequestId = ++requestsCounterRef.current;

      let searchParameters;

      if (!searchTerm) {
        searchParameters = { repository };
      } else if (searchTerm.length < 3) {
        setSearchError(Strings.errors.warningText);
        setRecentRevisions(null);
        return;
      } else if (useFulltextSearch) {
        // Fulltext mode: check if it's a hash
        searchParameters = isHash.test(searchTerm)
          ? { repository, hash: searchTerm }
          : { repository, search: searchTerm };
      } else {
        // Author mode: check if it contains non-hex characters
        searchParameters = authorInfoMatch.test(searchTerm)
          ? { repository, author: searchTerm }
          : { repository, hash: searchTerm };
      }

      // Keep the current searchTerm in ref so that we can use it when the
      // repository information changes.
      lastSearchTermRef.current = searchTerm;

      try {
        const results = await fetchRecentRevisions(searchParameters);
        if (thisRequestId !== requestsCounterRef.current) return;
        // The user edited the text since the request started.
        // Let's ignore the result then.
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

  // useEffect(() => {
  //   document.addEventListener('mousedown', handleDocumentMousedown);
  //   return () => {
  //     document.removeEventListener('mousedown', handleDocumentMousedown);
  //   };
  // }, [handleDocumentMousedown]);

  // useEffect(() => {
  //   document.addEventListener('keydown', handleEscKeypress);
  //   return () => {
  //     document.removeEventListener('keydown', handleEscKeypress);
  //   };
  // }, [handleEscKeypress]);

  const renderInput = (params: AutocompleteRenderInputParams) => (
    <AutocompleteInput
      params={params}
      searchError={searchError}
      inputPlaceholder={inputPlaceholder}
      searchType={searchType}
      compact={compact}
    />
  );

  const renderOption = (
    props: HTMLAttributes<HTMLLIElement>,
    option: Changeset,
  ) => (
    <AutocompleteOption
      {...props}
      key={option.id}
      index={recentRevisions?.indexOf(option) ?? 0}
      item={option}
      isChecked={displayedRevisions.map((rev) => rev.id).includes(option.id)}
      onToggle={onSearchResultsToggle}
      listItemComponent={listItemComponent}
    />
  );

  return (
    <Box ref={containerRef}>
      {/* <SearchInput
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
      )} */}

      <Autocomplete
        options={recentRevisions ?? []}
        getOptionLabel={(options) => options.revision}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        multiple={listItemComponent === 'checkbox'}
        disableCloseOnSelect={listItemComponent === 'checkbox'}
        filterOptions={(options) => options}
        onInputChange={(_, value) => onValueChange(value)}
        onChange={(_, value) => {
          if (value) {
            if (Array.isArray(value)) {
              // Handle multiple selection (checkbox mode)
              value.forEach((item) => onSearchResultsToggle(item));
            } else {
              // Handle single selection (radio mode)
              onSearchResultsToggle(value);
            }
          }
        }}
        renderInput={renderInput}
        renderOption={renderOption}
        loading={recentRevisions?.length === 0}
        loadingText={'Loading...'}
        noOptionsText={searchError || 'No results found'}
        slotProps={{
          listbox: {
            className: getListStyles(mode),
          },
        }}
      />
    </Box>
  );
}
