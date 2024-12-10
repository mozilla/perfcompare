import InfoIcon from '@mui/icons-material/InfoOutlined';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import Tooltip from '@mui/material/Tooltip';

import SearchDropdown from './SearchDropdown';
import SearchInputAndResults from './SearchInputAndResults';
import SelectedRevisions from './SelectedRevisions';
import { compareView } from '../../common/constants';
import { useAppSelector } from '../../hooks/app';
import { SearchStyles } from '../../styles';
import type { Changeset, InputType, Repository } from '../../types/state';

interface SearchProps {
  hasEditButton: boolean;
  isWarning: boolean;
  isBaseComp: boolean;
  displayedRevisions: Changeset[];
  onSearchResultsToggle: (item: Changeset) => void;
  onRemoveRevision: (item: Changeset) => void;
  selectLabel: string;
  tooltip: string;
  inputPlaceholder: string;
  repository: Repository['name'];
  labelIdInfo: string;
  onRepositoryChange: (repo: Repository['name']) => unknown;
  formIsDisplayed: boolean;
  listItemComponent?: 'checkbox' | 'radio';
}

function SearchComponent({
  hasEditButton,
  isBaseComp,
  displayedRevisions,
  onSearchResultsToggle,
  onRemoveRevision,
  selectLabel,
  tooltip,
  inputPlaceholder,
  isWarning,
  repository,
  labelIdInfo,
  onRepositoryChange,
  formIsDisplayed,
  listItemComponent,
}: SearchProps) {
  const mode = useAppSelector((state) => state.theme.mode);
  //SearchStyles can be found in CompareCards.ts
  const styles = SearchStyles(mode);
  const searchType: InputType = isBaseComp ? 'base' : 'new';

  return (
    <Grid className={styles.component}>
      <Grid
        item
        xs={2}
        display='flex'
        alignItems='center'
        className={`${isBaseComp ? 'base' : 'new'}-search-dropdown ${
          styles.dropDown
        } label-edit-wrapper`}
      >
        <InputLabel id={labelIdInfo} className='dropdown-select-label'>
          {selectLabel}
        </InputLabel>
        <Tooltip
          classes={{
            tooltip: `tooltip-${mode}`,
          }}
          placement='top'
          title={tooltip}
        >
          <InfoIcon fontSize='small' className='dropdown-info-icon' />
        </Tooltip>
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
            listItemComponent={listItemComponent}
          />
        </Grid>
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
