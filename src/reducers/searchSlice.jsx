const initialState = {
  repository: '',
  results: [],
  recentRevisions: [],
  searchValue: '',
};

export default function searchReducer(action, state = initialState) {
  switch (action.type) {
    case 'search/searchValueChanged': {
      return {
        ...state,
        searchValue: action.payload,
      };
    }
    case 'search/fetchRecentRevisions': {
      return {
        ...state,
        recentRevisions: action.payload,
      };
    }
    case 'search/repositoryChanged': {
      return {
        ...state,
        repository: action.payload,
      };
    }
    case 'search/searchResultsChanged': {
      return {
        ...state,
        results: action.payload,
      };
    }
    default:
      return state;
  }
}
