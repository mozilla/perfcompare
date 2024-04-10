import { useLoaderData } from 'react-router-dom';

import { LoaderReturnValue } from './loader';

export default function TaskclusterCallback() {
  const { access_token: accessToken, token_type: tokenType } =
    useLoaderData() as LoaderReturnValue;
  console.log('accessToken ', accessToken, 'tokenType ', tokenType);

  return (
    <div className='pt-5'>
      <h2 className='justify-content-center'>
        <p className='lead text-center'>Getting Taskcluster credentials...</p>
      </h2>
    </div>
  );
}
