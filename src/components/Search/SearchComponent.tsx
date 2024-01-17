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
//import { clearCheckedRevisionforType } from '../../reducers/SearchSlice';
import {
  Spacing,
  DropDownMenuRaw,
  DropDownItemRaw,
  //SearchStyles can be found in CompareCards.ts
  SearchStyles,
} from '../../styles';
import type { RevisionsList, ThemeMode, Repository } from '../../types/state';
// import CompareWithBaseContext from './CompareWithBaseContext';
import EditButton from './EditButton';
import SaveCancelButtons from './SaveCancelButtons';
import SearchDropdown from './SearchDropdown';
import SearchInput from './SearchInput';
import SearchResultsList from './SearchResultsList';
import SelectedRevisions from './SelectedRevisions';

interface RevisionsState {
  revs: RevisionsList[];
  repos: Repository['name'][];
}

interface InProgressState {
  revs: RevisionsList[];
  repos: Repository['name'][];
  isInProgress: boolean;
}
interface SearchProps {
  mode: ThemeMode;
  isEditable: boolean;
  isWarning: boolean;
  staging: RevisionsState;
  inProgress: InProgressState;
  isBase: boolean;
  searchResults: RevisionsList[];
  setInProgress: Dispatch<SetStateAction<InProgressState>>;
  setPopoverIsOpen?: Dispatch<SetStateAction<boolean>>;
  handleSave: () => void;
  handleCancel: () => void;
  handleEdit: () => void;
  prevRevision?: RevisionsList;
  selectLabel: string;
  tooltip: string;
  inputPlaceholder: string;
}

function SearchComponent({
  mode,
  isEditable,
  staging,
  inProgress,
  isBase,
  searchResults,
  setInProgress,
  handleCancel,
  handleSave,
  handleEdit,
  selectLabel,
  tooltip,
  inputPlaceholder,
}: SearchProps) {
  const styles = SearchStyles(mode);

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

  const [formIsDisplayed, setFormIsDisplayed] = useState(!isEditable);

  const displayRevisions =
    staging.revs.length > 0 || inProgress.revs.length > 0;

  const searchType = isBase ? 'base' : 'new';

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
  });

  return (
    <Grid className={styles.component}>
      <Grid
        item
        xs={2}
        className={`${isBase ? 'base' : 'new'}-search-dropdown ${
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
        {isEditable && !formIsDisplayed && (
          <EditButton
            formIsDisplayed={formIsDisplayed}
            setFormIsDisplayed={setFormIsDisplayed}
            isBase={isBase}
            onEdit={handleEdit || (() => {})}
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
            isEditable ? 'small' : ''
          } ${isEditable ? compareView : ''}-base-dropdown`}
        >
          <SearchDropdown
            isEditable={isEditable}
            selectLabel={selectLabel}
            tooltipText={tooltip}
            mode={mode}
            searchType={searchType}
          />
        </Grid>
        <Grid
          item
          xs={7}
          id={`${searchType}_search-input`}
          className={`${searchType}-search-input  ${styles.baseSearchInput} ${
            isEditable ? 'big' : ''
          } `}
        >
          <SearchInput
            mode={mode}
            onFocus={() => setDisplayDropdown(true)}
            isEditable={isEditable}
            inputPlaceholder={inputPlaceholder}
            searchType={searchType}
          />
          {searchResults.length > 0 && displayDropdown && (
            <SearchResultsList
              mode={mode}
              isEditable={isEditable}
              isBase={isBase}
              searchResults={searchResults}
              setInProgress={setInProgress}
              inProgress={inProgress}
            />
          )}
        </Grid>
        {/****** Cancel Save Buttons ******/}
        {isEditable && formIsDisplayed && (
          <SaveCancelButtons
            mode={mode}
            searchType={searchType}
            onSave={handleSave || (() => {})}
            onCancel={handleCancel}
            setFormIsDisplayed={setFormIsDisplayed}
          />
        )}
      </Grid>
      {/***** Selected Revisions Section *****/}
      {displayRevisions && (
        <Grid className='d-flex'>
          <SelectedRevisions
            searchType={searchType}
            formIsDisplayed={formIsDisplayed}
          />
        </Grid>
      )}
    </Grid>
  );
}

export default SearchComponent;
