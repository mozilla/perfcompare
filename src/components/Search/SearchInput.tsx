import * as React from 'react';

import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { connect } from 'react-redux';

import store from '../../common/store';
import { fetchRecentRevisions } from '../../thunks/searchThunk';
import { Revision, State } from '../../types/state';
import { handleChangeSearch } from '../../utils/searchViewHelper';
import SearchResultsList from './SearchResultsList';

class SearchInput extends React.Component<SearchInputProps> {
  componentDidMount() {
    const repo = store.getState().search.repository;
    store.dispatch(fetchRecentRevisions(repo));
  }

  render() {
    const {
      focused,
      handleFocus,
      handleChildClick,
      inputError,
      inputHelperText,
      searchResults,
    } = this.props;
    return (
      <Grid item xs={6}>
        {!inputError && !inputHelperText ? (
          /* text field without errors */
          <TextField
            label="Search By Revision ID or Author Email"
            id="search-revision-input"
            onFocus={handleFocus}
            variant="outlined"
            sx={{ width: '100%' }}
            onChange={handleChangeSearch}
          />
        ) : (
          /* text field with errors */
          <TextField
            error
            helperText={inputHelperText}
            label="Search By Revision ID or Author Email"
            id="search-revision-input"
            onFocus={handleFocus}
            variant="outlined"
            sx={{ width: '100%' }}
            onChange={handleChangeSearch}
          />
        )}
        {searchResults.length > 0 && focused && (
          <SearchResultsList handleChildClick={handleChildClick} />
        )}
      </Grid>
    );
  }
}

interface SearchInputProps {
  handleFocus: (e: React.FocusEvent) => void;
  handleChildClick: (e: React.MouseEvent) => void;
  inputError: boolean;
  inputHelperText: string;
  focused: boolean;
  searchResults: Revision[];
}

function mapStateToProps(state: State) {
  return {
    inputError: state.search.inputError,
    inputHelperText: state.search.inputHelperText,
    searchResults: state.search.searchResults,
  };
}

export default connect(mapStateToProps)(SearchInput);
