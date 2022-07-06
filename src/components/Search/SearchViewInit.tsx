import { useEffect } from 'react';

import { connect, useDispatch } from 'react-redux';

import { fetchRecentRevisions } from '../../thunks/searchThunk';
import { Repository, State } from '../../types/state';

// component to fetch recent revisions when search view is loaded
function SearchViewInit(props: SearchViewInitProps) {
  const dispatch = useDispatch();
  const { repository } = props;
  useEffect(() => {
    dispatch(fetchRecentRevisions(repository));
  }, []);
  return null;
}

interface SearchViewInitProps {
  repository: Repository['name'];
}

function mapStateToProps(state: State) {
  return {
    repository: state.search.repository,
  };
}

export default connect(mapStateToProps)(SearchViewInit);
