import React from 'react'

class CompareSearchDropdown extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            results: this.props.results,
        }
    }

    render() {
        return (
            <div className='mzp-c-menu-list'>
                <ul className='mzp-c-menu-list-list'>
                    {this.props.data.length > 0 &&
                        this.props.data.map((item, i) => (
                            <li className='mzp-c-menu-list-item' key={i}>
                                <span className=''>{item.revision.slice(0, 11)}</span> -{' '}
                                {item.author}
                            </li>
                        ))}
                </ul>
            </div>
        )
    }
}

export default CompareSearchDropdown
