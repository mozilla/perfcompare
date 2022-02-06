import React from "react";

class CompareSearchDropdown extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            results: this.props.data.slice(0,20)
        }
    }
    
    render() {
        console.log(this.state.results)
        return (
          <div className="mzp-c-menu-list">
            <ul className="mzp-c-menu-list-list">
              {this.state.results.map((item, i) => (
                <li className="mzp-c-menu-list-item" key={i}>
                  {item.revision}
                </li>
              ))}
            </ul>
          </div>
        );
    }
}

export default CompareSearchDropdown