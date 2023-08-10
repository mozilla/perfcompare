import {
  Dispatch,
  SetStateAction,
  useEffect,
  createRef,
  useState,
} from 'react';

import InfoIcon from '@mui/icons-material/InfoOutlined';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import Tooltip from '@mui/material/Tooltip';
import useMediaQuery from '@mui/material/useMediaQuery';
import { cssRule } from 'typestyle';
import { style } from 'typestyle';

import { compareView } from '../../common/constants';
import { useAppSelector, useAppDispatch } from '../../hooks/app';
import useSelectedRevisions from '../../hooks/useSelectedRevisions';
import { clearCheckedRevisionforType } from '../../reducers/SearchSlice';
import { Strings } from '../../resources/Strings';
import {
  Spacing,
  DropDownMenuRaw,
  DropDownItemRaw,
  ButtonStyles,
  SearchStyles,
} from '../../styles';
import type {
  RevisionsList,
  InputType,
  ThemeMode,
  View,
} from '../../types/state';
import SearchDropdown from './SearchDropdown';
import SearchInput from './SearchInput';
import SearchResultsList from './SearchResultsList';
import SelectedRevisions from './SelectedRevisions';

const editImgUrl = Strings.components.searchDefault.base.icons.editImgUrl;

interface SearchProps {
  mode: ThemeMode;
  view: View;
  setPopoverIsOpen?: Dispatch<SetStateAction<boolean>>;
  prevRevision?: RevisionsList;
  selectLabel: string;
  tooltip: string;
  inputPlaceholder: string;
  searchType: InputType;
  isWarning: boolean;
}

function SearchComponent({
  mode,
  view,
  selectLabel,
  tooltip,
  inputPlaceholder,
  searchType,
  isWarning,
}: SearchProps) {
  const styles = SearchStyles(mode);
  const btnStyles = ButtonStyles(mode);
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
  const cancelBtn = {
    main: style({
      $nest: {
        '&.MuiButtonBase-root': {
          ...btnStyles.Secondary,
        },
      },
    }),
  };

  const dispatch = useAppDispatch();
  const checkedRevisionsList = useAppSelector(
    (state) => state.search[searchType].checkedRevisions,
  );
  const searchState = useAppSelector((state) => state.search[searchType]);
  const selectedRevisions = useAppSelector(
    (state) => state.selectedRevisions.revisions,
  );
  const { editSelectedRevisions, updateSelectedRevisions } =
    useSelectedRevisions();

  const { searchResults } = searchState;
  const [focused, setFocused] = useState(false);
  const [dropDownInputVisible, setDropDownInputVisible] = useState(true);
  const [editBtnVisible, toggleEditBtnVisible] = useState(true);
  const matchesQuery = useMediaQuery('(max-width:768px)');
  const containerRef = createRef<HTMLDivElement>();

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

  useEffect(() => {
    if (view == compareView) {
      setDropDownInputVisible(false);
    }
  }, [view]);

  const handleEditAction = () => {
    setDropDownInputVisible(true);
    toggleEditBtnVisible(!editBtnVisible);
    editSelectedRevisions(searchType);
  };

  const handleCancelAction = () => {
    setDropDownInputVisible(false);
    toggleEditBtnVisible(!editBtnVisible);
    dispatch(clearCheckedRevisionforType({ searchType }));
  };

  const handleSaveAction = () => {
    setDropDownInputVisible(false);
    toggleEditBtnVisible(!editBtnVisible);
    updateSelectedRevisions(searchType);
    dispatch(clearCheckedRevisionforType({ searchType }));
  };

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

        {view == compareView && (
          <Button
            className={`edit-button ${!editBtnVisible ? 'hidden' : ''}`}
            role='button'
            name='edit-button'
            aria-label='edit button'
            onClick={handleEditAction}
          >
            <img className='icon icon-edit' src={editImgUrl} alt='edit-icon' />
          </Button>
        )}
      </Grid>

      {dropDownInputVisible && (
        <Grid
          container
          alignItems='flex-start'
          id={`${searchType}-search-container`}
          className={styles.container}
          ref={containerRef}
        >
          <Grid
            item
            xs={2}
            id={`${searchType}_search-dropdown`}
            className={`${searchType}-search-dropdown ${styles.dropDown} ${
              view === compareView ? 'small' : ''
            }`}
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
            {searchResults.length > 0 && focused && focused !== undefined && (
              <SearchResultsList
                mode={mode}
                view={view}
                searchType={searchType}
              />
            )}
          </Grid>
          {view === compareView && (
            <div className='cancel-save-btns' id='cancel-save_btns'>
              <Button
                className={`cancel-save cancel-button ${cancelBtn.main} ${
                  editBtnVisible ? 'hidden' : ''
                }`}
                role='button'
                name='cancel-button'
                aria-label='cancel button'
                variant='contained'
                onClick={handleCancelAction}
              >
                Cancel
              </Button>
              <Button
                className={`cancel-save save-button ${
                  editBtnVisible ? 'hidden' : ''
                }`}
                role='button'
                name='save-button'
                aria-label='save button'
                variant='contained'
                onClick={handleSaveAction}
              >
                Save
              </Button>
            </div>
          )}
        </Grid>
      )}

      {(checkedRevisionsList.length > 0 ||
        (selectedRevisions && selectedRevisions.length > 0)) && (
        <Grid className='d-flex'>
          <SelectedRevisions
            searchType={searchType}
            mode={mode}
            isWarning={isWarning}
            view={view}
            editBtnVisible={editBtnVisible}
          />
        </Grid>
      )}
    </Grid>
  );
}

export default SearchComponent;
