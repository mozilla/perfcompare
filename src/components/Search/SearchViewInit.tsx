import React from 'react';

import { connect } from 'react-redux';

import store from '../../common/store';
import { fetchRecentRevisions } from '../../thunks/searchThunk';
import { Repository, State } from '../../types/state';

// component to fetch recent revisions when search view is loaded
class SearchViewInit extends React.Component<SearchViewInitProps> {
  componentDidMount() {
    const { repository } = this.props;
    store.dispatch(fetchRecentRevisions(repository));
  }

  render() {
    return null;
  }
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
