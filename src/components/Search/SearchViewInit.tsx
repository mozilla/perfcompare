import { useEffect } from 'react';

import { connect } from 'react-redux';

import { useAppDispatch } from '../../hooks/app';
import { fetchRecentRevisions } from '../../thunks/searchThunk';
import type { Repository, State } from '../../types/state';

// component to fetch recent revisions when search view is loaded
function SearchViewInit(props: SearchViewInitProps) {
  const dispatch = useAppDispatch();
  const { repository } = props;
  useEffect(() => {
    void dispatch(fetchRecentRevisions(repository));
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
