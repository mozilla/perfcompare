import { useEffect } from 'react';

import { useLocation } from 'react-router-dom';

import { routeTitles } from '../../common/constants';

function PageTitle() {
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname;
        const title = routeTitles[path];
        document.title = `${title}`;
    }, [location]);

    return null;
}

export default PageTitle;