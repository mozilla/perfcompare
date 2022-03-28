import React from 'react';

import CompareSearchDropdown from './CompareSearchDropdown';

class CompareSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchValue: '',
    };
  }

  handleChange = (event) => {
    const search = event.target.value;
    this.setState({
      searchValue: search,
    });
  };

  render() {
    const { searchValue } = this.state;
    return (
      <div className="mzp-c-form mzp-l-stretch">
        Select a revision to compare:
        <input
          type="search"
          className="mzp-c-field-control"
          placeholder="Search by revision ID, author, or commit message"
          onChange={this.handleChange}
        />
        {searchValue.length > 0 && <CompareSearchDropdown />}
      </div>
    );
  }
}

export default CompareSearch;
