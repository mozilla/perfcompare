import { useEffect, useState } from 'react';

import { useSearchParams } from 'react-router-dom';

// TODO remove this after integrating the auth code logic
localStorage.setItem('requestState', 'OkCrH5isZncYqeJbRDelN');
localStorage.setItem('tcRootUrl', 'https://firefox-ci-tc.services.mozilla.com');
// end TODO remove

const tcAuthCallbackUrl = '/taskcluster-auth';
const redirectURI = `${window.location.origin}${tcAuthCallbackUrl}`;
// TODO update to a valid perfcompare clientId
const clientId = `treeherder-localhost-5000-client`;

interface RequestOptions {
  method: string;
  body: string;
  headers: {
    'Content-Type': string;
  };
}

// from treeherder
const processErrorMessage = async (error: string, status) => {
  let errorMessage = '';

  if (status >= 500) {
    errorMessage +=
      'There was a problem retrieving the data. Please try again in a minute.';
  }

  if (status === 400) {
    errorMessage += 'The action resulted in a bad request.';
  }

  if (error instanceof Object) {
    const key = Object.keys(error);

    errorMessage += ` ${key}: ${error[key]}`;
  } else if (error) {
    errorMessage += error;
  }
  return errorMessage ? errorMessage.trim() : error;
};

// from treeherder, TODO move this in another file/folder
const getData = async (url: string, options: RequestOptions) => {
  let failureStatus = null;
  const response = await fetch(url, options);

  if (!response.ok) {
    failureStatus = response.status;
  }

  const contentType = response.headers.get('content-type');

  if (contentType && contentType !== 'application/json' && failureStatus) {
    const errorMessage = processErrorMessage(
      `${failureStatus}: ${response.statusText}`,
      failureStatus,
    );
    return { data: errorMessage, failureStatus };
  }

  let data = await response.json();

  if (failureStatus) {
    data = processErrorMessage(data, failureStatus);
  }
  return { data, failureStatus };
};

function TaskclusterCallback() {
  const [searchParams] = useSearchParams();
  const [errorMessage, setErrorMessage] = useState('');

  const code = searchParams.get('code') as string;
  const state = searchParams.get('state') as string;
  const requestState = localStorage.getItem('requestState');

  const getCredentials = async (taskclusterCode: string) => {
    const rootUrl = localStorage.getItem('tcRootUrl');

    if (!rootUrl) {
      setErrorMessage(errorMessage);
      return;
    }

    // fetch token Bearer, it will be used to fetch the access_token
    const options = {
      mode: 'no-cors',
      method: 'POST',
      body: `grant_type=authorization_code&code=${taskclusterCode}&redirect_uri=${redirectURI}&client_id=${clientId}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    };
    console.log(`${rootUrl}/login/oauth/token`, options);
    const response = await getData(`${rootUrl}/login/oauth/token`, options);
    console.log('response ', response);

    if (response.failureStatus) {
      setErrorMessage(`errorMessage ${response.data}`);
      return;
    }

    // TODO continue with fetchCredentials using response access_token Bearer
  };

  useEffect(() => {
    if (code && requestState && requestState === state) {
      void getCredentials(code);
    } else {
      if (errorMessage) {
        setErrorMessage(
          errorMessage + `We received error: ${errorMessage} from Taskcluster.`,
        );
      }
    }
  }, [code, state, requestState]);

  return (
    <div className='pt-5'>
      <h2 className='justify-content-center'>
        <p className='lead text-center'>Getting Taskcluster credentials...</p>
      </h2>
    </div>
  );
}

export default TaskclusterCallback;
