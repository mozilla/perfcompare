import {
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
  useCallback,
} from 'react';

import InfoIcon from '@mui/icons-material/InfoOutlined';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import Tooltip from '@mui/material/Tooltip';
import { cssRule } from 'typestyle';

import { compareView } from '../../common/constants';
import { useAppSelector } from '../../hooks/app';
import {
  Spacing,
  DropDownMenuRaw,
  DropDownItemRaw,
  //SearchStyles can be found in CompareCards.ts
  SearchStyles,
} from '../../styles';
import type { Changeset, InputType } from '../../types/state';
import EditButton from './EditButton';
import SaveCancelButtons from './SaveCancelButtons';
import SearchDropdown from './SearchDropdown';
import SearchInput from './SearchInput';
import SearchResultsList from './SearchResultsList';
import SelectedRevisions from './SelectedRevisions';

interface SearchProps {
  hasNonEditableState: boolean;
  isWarning: boolean;
  isBaseComp: boolean;
  searchResults: Changeset[];
  displayedRevisions: Changeset[];
  setPopoverIsOpen?: Dispatch<SetStateAction<boolean>>;
  onSave: () => void;
  onCancel: () => void;
  onEdit: () => void;
  onSearchResultsToggle: (item: Changeset) => void;
  onRemoveRevision: (item: Changeset) => void;
  prevRevision?: Changeset;
  selectLabel: string;
  tooltip: string;
  inputPlaceholder: string;
}

function SearchComponent({
  hasNonEditableState,
  isBaseComp,
  searchResults,
  displayedRevisions,
  onCancel,
  onSave,
  onEdit,
  onSearchResultsToggle,
  onRemoveRevision,
  selectLabel,
  tooltip,
  inputPlaceholder,
  isWarning,
}: SearchProps) {
  const mode = useAppSelector((state) => state.theme.mode);
  const styles = SearchStyles(mode);
  const searchType: InputType = isBaseComp ? 'base' : 'new';

  /* These overriding rules update the theme mode by accessing the otherwise inaccessible MUI tooltip styles */
  cssRule('.MuiPopover-root', {
    $nest: {
      '.MuiPaper-root': {
        flexDirection: 'column',
        ...(mode === 'light' ? DropDownMenuRaw.Light : DropDownMenuRaw.Dark),
        $nest: {
          '.MuiList-root': {
            padding: `${Spacing.Small}px ${Spacing.xSmall}px`,
            $nest: {
              '.MuiMenuItem-root': {
                ...(mode === 'light'
                  ? DropDownItemRaw.Light
                  : DropDownItemRaw.Dark),
              },
            },
          },
        },
      },
    },
  });

  const [displayDropdown, setDisplayDropdown] = useState(false);
  const [formIsDisplayed, setFormIsDisplayed] = useState(!hasNonEditableState);

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
    <Grid className={styles.component}>
      <Grid
        item
        xs={2}
        className={`${isBaseComp ? 'base' : 'new'}-search-dropdown ${
          styles.dropDown
        } label-edit-wrapper`}
      >
        <InputLabel
          id='select-repository-label'
          className='dropdown-select-label'
        >
          {selectLabel}
          <Tooltip placement='top' title={tooltip}>
            <InfoIcon fontSize='small' className='dropdown-info-icon' />
          </Tooltip>
        </InputLabel>
        {/**** Edit Button ****/}
        {hasNonEditableState && !formIsDisplayed && (
          <EditButton
            isBase={isBaseComp}
            onEditAction={() => {
              onEdit();
              setFormIsDisplayed(true);
            }}
          />
        )}
      </Grid>
      {/**** Search - DropDown Section ****/}
      <Grid
        container
        alignItems='flex-start'
        id={`${searchType}-search-container`}
        className={`${styles.container} ${
          formIsDisplayed ? 'show-container' : 'hide-container'
        } `}
      >
        <Grid
          item
          xs={2}
          id={`${searchType}_search-dropdown`}
          className={`${searchType}-search-dropdown ${styles.dropDown} ${
            hasNonEditableState ? 'small' : ''
          } ${hasNonEditableState ? compareView : ''}-base-dropdown`}
        >
          <SearchDropdown
            compact={hasNonEditableState}
            selectLabel={selectLabel}
            tooltipText={tooltip}
            searchType={searchType}
          />
        </Grid>
        <Grid
          item
          xs={7}
          id={`${searchType}_search-input`}
          className={`${searchType}-search-input  ${styles.baseSearchInput} ${
            hasNonEditableState ? 'big' : ''
          } `}
        >
          <SearchInput
            onFocus={() => setDisplayDropdown(true)}
            compact={hasNonEditableState}
            inputPlaceholder={inputPlaceholder}
            searchType={searchType}
          />
          {searchResults.length > 0 && displayDropdown && (
            <SearchResultsList
              hasNonEditableState={hasNonEditableState}
              isBase={isBaseComp}
              searchResults={searchResults}
              displayedRevisions={displayedRevisions}
              onToggle={onSearchResultsToggle}
            />
          )}
        </Grid>
        {/****** Cancel Save Buttons ******/}
        {hasNonEditableState && formIsDisplayed && (
          <SaveCancelButtons
            searchType={searchType}
            onSave={() => {
              onSave();
              setFormIsDisplayed(false);
            }}
            onCancel={() => {
              onCancel();
              setFormIsDisplayed(false);
            }}
          />
        )}
      </Grid>
      {/***** Selected Revisions Section *****/}
      {displayedRevisions && (
        <Grid className='d-flex'>
          <SelectedRevisions
            isBase={isBaseComp}
            hasNonEditableState={hasNonEditableState}
            canRemoveRevision={!hasNonEditableState || formIsDisplayed}
            isWarning={isWarning}
            displayedRevisions={displayedRevisions}
            onRemoveRevision={onRemoveRevision}
          />
        </Grid>
      )}
    </Grid>
  );
}

export default SearchComponent;
