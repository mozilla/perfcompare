import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import InfoIcon from '@mui/icons-material/InfoOutlined';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import Tooltip from '@mui/material/Tooltip';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useLocation } from 'react-router-dom';
import { cssRule } from 'typestyle';

import { compareView, searchView } from '../../common/constants';
import { useAppDispatch } from '../../hooks/app';
import { useAppSelector } from '../../hooks/app';
import useSelectedRevisions from '../../hooks/useSelectedRevisions';
import { clearCheckedRevisionforType } from '../../reducers/SearchSlice';
import {
  Spacing,
  DropDownMenuRaw,
  DropDownItemRaw,
  //SearchStyles can be found in CompareCards.ts
  SearchStyles,
} from '../../styles';
import type {
  RevisionsList,
  InputType,
  ThemeMode,
  Repository,
} from '../../types/state';
import EditButton from './EditButton';
import SaveCancelButtons from './SaveCancelButtons';
import SearchDropdown from './SearchDropdown';
import SearchInput from './SearchInput';
import SearchResultsList from './SearchResultsList';
import SelectedRevisions from './SelectedRevisions';

interface SearchProps {
  mode: ThemeMode;
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
  mode,
  selectLabel,
  tooltip,
  inputPlaceholder,
  searchType,
  isEditable,
  isWarning,
  revisions,
  repositories,
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

  const dispatch = useAppDispatch();
  const { updateSelectedRevisions } = useSelectedRevisions();

  const searchState = useAppSelector((state) => state.search[searchType]);
  const { searchResults } = searchState;
  const [focused, setFocused] = useState(false);
  const [formIsDisplayed, setFormIsDisplayed] = useState(!isEditable);

  const location = useLocation();
  const view = location.pathname == '/' ? searchView : compareView;
  const matchesQuery = useMediaQuery('(max-width:768px)');
  const handleCancelAction = () => {
    dispatch(clearCheckedRevisionforType({ searchType }));
    setFormIsDisplayed(false);
  };

  const handleSaveAction = () => {
    updateSelectedRevisions(searchType);
    dispatch(clearCheckedRevisionforType({ searchType }));
    setFormIsDisplayed(false);
  };

  const handleFocus = (e: MouseEvent) => {
    if (
      (e.target as HTMLElement).matches(`#${searchType}-search-container, 
      #${searchType}-search-container *`) &&
      // do not open search results when dropdown or cancel button is clicked
      !(e.target as HTMLElement).matches(
        `#${searchType}_search-dropdown,
        #${searchType}_search-dropdown *,
        #cancel-save_btns, 
        #cancel-save_btns *`,
      )
    ) {
      setFocused(true);
      return;
    }
    setFocused(false);
  };

  const handleEscKeypress = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setFocused(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleFocus);
    return () => {
      document.removeEventListener('mousedown', handleFocus);
    };
  }, []);

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
            mode={mode}
            searchType={searchType}
          />
        </Grid>
        <Grid
          item
          xs={7}
          id={`${searchType}_search-input`}
          className={`${searchType}-search-input ${
            matchesQuery ? `${searchType}-search-input--mobile` : ''
          } ${styles.baseSearchInput} ${view === compareView ? 'big' : ''} `}
        >
          <SearchInput
            mode={mode}
            setFocused={setFocused}
            view={view}
            inputPlaceholder={inputPlaceholder}
            searchType={searchType}
          />
          {searchResults.length > 0 && focused && (
            <SearchResultsList
              mode={mode}
              view={view}
              searchType={searchType}
            />
          )}
        </Grid>
        {/****** Cancel Save Buttons ******/}
        {isEditable && formIsDisplayed && (
          <SaveCancelButtons
            mode={mode}
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
            mode={mode}
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
