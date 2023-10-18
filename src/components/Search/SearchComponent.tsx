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
import { useLocation } from 'react-router-dom';
import { cssRule } from 'typestyle';

import { compareView, searchView } from '../../common/constants';
import { useAppDispatch, useAppSelector } from '../../hooks/app';
import useSelectedRevisions from '../../hooks/useSelectedRevisions';
import { clearCheckedRevisionforType } from '../../reducers/SearchSlice';
import {
  Spacing,
  DropDownMenuRaw,
  DropDownItemRaw,
  //SearchStyles can be found in CompareCards.ts
  SearchStyles,
} from '../../styles';
import type { RevisionsList, InputType, Repository } from '../../types/state';
import EditButton from './EditButton';
import SaveCancelButtons from './SaveCancelButtons';
import SearchDropdown from './SearchDropdown';
import SearchInput from './SearchInput';
import SearchResultsList from './SearchResultsList';
import SelectedRevisions from './SelectedRevisions';

interface SearchProps {
  setPopoverIsOpen?: Dispatch<SetStateAction<boolean>>;
  prevRevision?: RevisionsList;
  selectLabel: string;
  tooltip: string;
  inputPlaceholder: string;
  searchType: InputType;
  isEditable: boolean;
  isWarning: boolean;
  revisions: RevisionsList[];
  repositories: Repository['name'][];
}

function SearchComponent({
  selectLabel,
  tooltip,
  inputPlaceholder,
  searchType,
  isEditable,
  isWarning,
  revisions,
  repositories,
}: SearchProps) {
  const mode = useAppSelector((state) => state.theme.mode);
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

  const dispatch = useAppDispatch();
  const { updateSelectedRevisions } = useSelectedRevisions();

  const dispatch = useAppDispatch();
  const { updateSelectedRevisions } = useSelectedRevisions();

  const searchState = useAppSelector((state) => state.search[searchType]);
  const { searchResults } = searchState;
  const [displayDropdown, setDisplayDropdown] = useState(false);
  const [formIsDisplayed, setFormIsDisplayed] = useState(!isEditable);

  const location = useLocation();
  const view = location.pathname == '/' ? searchView : compareView;
  // const matchesQuery = useMediaQuery('(max-width:768px)');
  const handleCancelAction = () => {
    dispatch(clearCheckedRevisionforType({ searchType }));
    setFormIsDisplayed(false);
  };

  const handleSaveAction = () => {
    updateSelectedRevisions(searchType);
    dispatch(clearCheckedRevisionforType({ searchType }));
    setFormIsDisplayed(false);
  };

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
        className={`${searchType}-search-dropdown ${styles.dropDown} label-edit-wrapper`}
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
            searchType={searchType}
            setFormIsDisplayed={setFormIsDisplayed}
            formIsDisplayed={formIsDisplayed}
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
            view == compareView ? 'small' : ''
          } ${view}-base-dropdown`}
        >
          <SearchDropdown
            view={view}
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
            view === compareView ? 'big' : ''
          } `}
        >
          <SearchInput
            onFocus={() => setDisplayDropdown(true)}
            view={view}
            inputPlaceholder={inputPlaceholder}
            searchType={searchType}
          />
          {searchResults.length > 0 && displayDropdown && (
            <SearchResultsList view={view} searchType={searchType} />
          )}
        </Grid>
        {/****** Cancel Save Buttons ******/}
        {isEditable && formIsDisplayed && (
          <SaveCancelButtons
            searchType={searchType}
            onSave={handleSaveAction}
            onCancel={handleCancelAction}
          />
        )}
      </Grid>
      {/***** Selected Revisions Section *****/}
      {revisions && revisions.length > 0 && (
        <Grid className='d-flex'>
          <SelectedRevisions
            searchType={searchType}
            isWarning={isWarning}
            formIsDisplayed={formIsDisplayed}
            isEditable={isEditable}
            revisions={revisions}
            repositories={repositories}
          />
        </Grid>
      )}
    </Grid>
  );
}

export default SearchComponent;
