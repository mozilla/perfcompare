import { useState } from 'react';

import EditIcon from '@mui/icons-material/Edit';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import { connect } from 'react-redux';

import { Revision, State } from '../../types/state';
import SearchDropdown from '../Search/SearchDropdown';
import SearchInput from '../Search/SearchInput';
import SearchResultsList from '../Search/SearchResultsList';

function EditRevision(props: EditRevisionProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const { focused, handleFocus, rowID, revision, searchResults } = props;

  const handleClick = () => {
    const el = document.getElementById(revision);
    console.log(el);
    setAnchorEl(el);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <Container maxWidth="lg">
      <IconButton id="edit-revision-button" onClick={handleClick}>
        <EditIcon />
      </IconButton>
      <Popover
        id={`edit-revision-${rowID}`}
        className="edit-revision"
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        PaperProps={{
          style: { width: '100%', padding: '10px' },
        }}
      >
        <Grid container>
          <SearchDropdown muiXs={1} />
          <SearchInput muiXs={10} handleFocus={handleFocus} />
        </Grid>
        <Grid container>
          <Grid item xs={1} />
          <Grid item xs={10}>
            {searchResults.length > 0 && focused && <SearchResultsList />}
          </Grid>
        </Grid>
      </Popover>
    </Container>
  );
}

EditRevision.displayName = 'EditRevision';

interface EditRevisionProps {
  focused?: boolean | undefined;
  handleFocus?: (e: React.FocusEvent) => void | undefined;
  rowID: Revision['id'];
  revision: Revision['revision'];
  searchResults: Revision[];
}

function mapStateToProps(state: State) {
  return {
    searchResults: state.search.searchResults,
  };
}

export default connect(mapStateToProps)(EditRevision);
