import { useEffect } from 'react';

import { connect } from 'react-redux';

import type { RootState } from '../../common/store';
import { useAppDispatch } from '../../hooks/app';
import { fetchRecentRevisions } from '../../thunks/searchThunk';
import type { Repository } from '../../types/state';

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

function mapStateToProps(state: RootState) {
  return {
    repository: state.search.repository,
  };
}

export default connect(mapStateToProps)(SearchViewInit);
