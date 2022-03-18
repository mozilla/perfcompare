import React from 'react'
import data_autoland from '../data/autoland.json'
import data_try from '../data/try.json'
import data_central from '../data/mozilla-central.json'

import SearchView from './SearchView'

function App() {
    let data = {
        try: [],
        'mozilla-central': [],
        autoland: [],
    }

    data.autoland = [...data_autoland.results]
    data.try = [...data_try.results]
    data['mozilla-central'] = [...data_central.results]

    return <SearchView data={data} />
}

export default App
