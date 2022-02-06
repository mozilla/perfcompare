import React from 'react'
import data_autoland from '../data/autoland.json'
import data_try from '../data/try.json'
import data_central from '../data/mozilla-central.json'


import Compare from './Compare'

function App() {
  let data = {
    "try": [],
    "mozilla-central": [],
    "autoland": []
  }

  data.autoland = [...data_autoland.results]
  data.try = [...data_try.results]
  data['mozilla-central'] = [...data_central.results]

  return (
    <Compare data={data}/>
  )
}


export default App
