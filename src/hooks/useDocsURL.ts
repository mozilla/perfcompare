import { useState, useEffect } from 'react';

import { frameworkMap } from '../common/constants';
import { Framework } from '../types/types';

type SupportedPerfdocsFramework = 'talos' | 'awsy' | 'devtools';
const supportedPerfdocsFrameworks : Record<SupportedPerfdocsFramework, string> = {
    talos: 'talos',
    awsy: 'awsy',
    devtools: 'performance-tests-overview',
    
  };

const useDocsURL = (suite: string, framework_id: Framework['id']) => {

    const [docsURL, setdocsURL] = useState('');
    const [isLinkSupported, setIsLinkSupported] = useState(true);

    useEffect(() => {

  const framework = frameworkMap[framework_id];
  const supportedFramework = supportedPerfdocsFrameworks[framework as SupportedPerfdocsFramework];
  const urlReadySuite =  suite.replace(/:|\s|\.|_/g, '-').toLowerCase();

  const baseURL = 'https://firefox-source-docs.mozilla.org';

  if (framework_id === 12 && supportedFramework) {
      setdocsURL(`${baseURL}/devtools/tests/${supportedFramework}.html#${urlReadySuite}`);

  } else if (supportedFramework) {
    setdocsURL(`${baseURL}/testing/perfdocs/${supportedFramework}.html#${urlReadySuite}`);
  } else {
    setIsLinkSupported(false);
  }

}, [suite, framework_id]);

  return { docsURL, isLinkSupported };
  
};


export default useDocsURL;