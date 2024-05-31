import { useState } from 'react';

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
import type { Changeset, InputType, Repository } from '../../types/state';
import EditButton from './EditButton';
import SaveCancelButtons from './SaveCancelButtons';
import SearchDropdown from './SearchDropdown';
import SearchInputAndResults from './SearchInputAndResults';
import SelectedRevisions from './SelectedRevisions';

interface SearchProps {
  hasEditButton: boolean;
  isWarning: boolean;
  isBaseComp: boolean;
  displayedRevisions: Changeset[];
  onSave: () => void;
  onCancel: () => void;
  onEdit: () => void;
  onSearchResultsToggle: (item: Changeset) => void;
  onRemoveRevision: (item: Changeset) => void;
  selectLabel: string;
  tooltip: string;
  inputPlaceholder: string;
  repository: Repository['name'];
  labelIdInfo: string;
  onRepositoryChange: (repo: Repository['name']) => unknown;
}

function SearchComponent({
  hasEditButton,
  isBaseComp,
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
  repository,
  labelIdInfo,
  onRepositoryChange,
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

  const [formIsDisplayed, setFormIsDisplayed] = useState(!hasEditButton);

  return (
    <Grid className={styles.component}>
      <Grid
        item
        xs={2}
        className={`${isBaseComp ? 'base' : 'new'}-search-dropdown ${
          styles.dropDown
        } label-edit-wrapper`}
      >
        <InputLabel id={labelIdInfo} className='dropdown-select-label'>
          {selectLabel}
          <Tooltip placement='top' title={tooltip}>
            <InfoIcon fontSize='small' className='dropdown-info-icon' />
          </Tooltip>
        </InputLabel>
        {/**** Edit Button ****/}
        {hasEditButton && !formIsDisplayed && (
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
            hasEditButton ? 'small' : ''
          } ${hasEditButton ? compareView : ''}-base-dropdown`}
        >
          <SearchDropdown
            compact={hasEditButton}
            selectLabel={selectLabel}
            searchType={searchType}
            repository={repository}
            labelIdInfo={labelIdInfo}
            onChange={onRepositoryChange}
          />
        </Grid>
        <Grid
          item
          xs={7}
          id={`${searchType}_search-input`}
          className={`${searchType}-search-input  ${styles.baseSearchInput} ${
            hasEditButton ? 'big' : ''
          } `}
        >
          <SearchInputAndResults
            compact={hasEditButton}
            inputPlaceholder={inputPlaceholder}
            displayedRevisions={displayedRevisions}
            searchType={searchType}
            repository={repository}
            onSearchResultsToggle={onSearchResultsToggle}
          />
        </Grid>
        {/****** Cancel Save Buttons ******/}
        {hasEditButton && formIsDisplayed && (
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
        <Grid
          className='d-flex'
          data-testid={`${searchType}-selected-revision`}
        >
          <SelectedRevisions
            isBase={isBaseComp}
            canRemoveRevision={!hasEditButton || formIsDisplayed}
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
