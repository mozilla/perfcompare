import React from 'react'

import CompareSearch from './CompareSearch'

const Compare = (props) => (
  <div className="mzp-l-content mzp-t-content-md" data-testid="Compare">
      <h1 className="mzp-c-section-heading mzp-has-zap-10">
        Perf<strong>Compare</strong>
      </h1>
    <CompareSearch data={props.data} />
  </div>
);

export default Compare
