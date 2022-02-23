import React from 'react';

class DropdownButton extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
        toggled: false,
        selected: false,
        text: this.props.text
    }
  }

  toggleDropdown = () => {
      this.setState({toggled: !this.state.toggled})
  }
  
  dropdownSelect = (event) => {
    console.log(event)
    this.setState({ selected: true, text: event.target.innerText, toggled: false })
  }

  render() {
      console.log(this.state.toggled)
      return (
        <span className='dropdown-button-container'>
          <button
            id={this.props.buttonID}
            className={
              this.state.toggled
                ? 'dropdown-visible dropdown-button-left mzp-c-button mzp-t-product mzp-t-secondary mzp-t-md'
                : 'dropdown-button-left mzp-c-button mzp-t-product mzp-t-secondary mzp-t-md'
            }
            onClick={this.toggleDropdown}
          >
            {this.state.text} <i className='fa-solid fa-angle-down'></i>
          </button>
          <ul className={this.state.toggled ? 'dropdown-visible' : 'dropdown-hidden'}>
            {this.state.toggled &&
              this.props.options.map((item, i) => (
                <li key={i} value={item} onClick={this.dropdownSelect}>
                  {item}
                </li>
              ))}
          </ul>
        </span>
      )
  }
}

export default DropdownButton