import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { connect } from 'react-redux';

import useHandleChangeSearch from '../../hooks/useHandleChangeSearch';
import { State } from '../../types/state';

function SearchInput(props: SearchInputProps) {
  const { handleFocus, inputError, inputHelperText, muiXs } = props;
  const { handleChangeSearch } = useHandleChangeSearch();
  return (
    <Grid item xs={muiXs}>
      {!inputError && !inputHelperText ? (
        /* text field without errors */
        <TextField
          label="Search By Revision ID or Author Email"
          id="search-revision-input"
          onFocus={handleFocus}
          variant="outlined"
          sx={{ width: '100%' }}
          onChange={(e) => handleChangeSearch(e)}
          InputLabelProps={{ shrink: false }}
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
          onChange={(e) => handleChangeSearch(e)}
        />
      )}
    </Grid>
  );
}

interface SearchInputProps {
  handleFocus?: (e: React.FocusEvent) => void | undefined;
  inputError: boolean;
  inputHelperText: string;
  muiXs: number;
}

function mapStateToProps(state: State) {
  return {
    inputError: state.search.inputError,
    inputHelperText: state.search.inputHelperText,
    searchResults: state.search.searchResults,
  };
}

export default connect(mapStateToProps)(SearchInput);
