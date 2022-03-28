import React from 'react';

class CompareSearchDropdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      results: [],
    };
  }

  render() {
    const { results } = this.state;
    return (
      <div className="mzp-c-menu-list">
        <ul className="mzp-c-menu-list-list">
          {results.map((item) => (
            <li className="mzp-c-menu-list-item" key={item.revision}>
              {item.revision}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default CompareSearchDropdown;
