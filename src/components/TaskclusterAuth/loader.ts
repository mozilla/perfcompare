import {
  storeUserToken,
  storeUserCredentials,
} from '../../logic/credentials-storage';
import {
  retrieveTaskclusterUserCredentials,
  retrieveTaskclusterToken,
} from '../../logic/taskcluster';

async function doRetrievalAndStore({
  rootUrl,
  taskclusterCode,
}: {
  rootUrl: string;
  taskclusterCode: string;
}): Promise<void> {
  const tokenResponse = await retrieveTaskclusterToken(
    rootUrl,
    taskclusterCode,
  );

  storeUserToken(rootUrl, tokenResponse);

  // fetch access token with token Bearer
  const userCredentials = await retrieveTaskclusterUserCredentials(
    rootUrl,
    tokenResponse.access_token,
  );

  storeUserCredentials(rootUrl, userCredentials);

  window.close();
}

export function loader({ request }: { request: Request }) {
  const url = new URL(request.url);

  const taskclusterCode = url.searchParams.get('code') as string;
  const state = url.searchParams.get('state');

  const requestState = sessionStorage.getItem('requestState');

  const rootUrl = sessionStorage.getItem('taskclusterUrl') as string;

  if (!taskclusterCode) {
    throw new Error(`Error when getting Taskcluster code from URL.`);
  }

  if (!requestState || !state || requestState !== state) {
    throw new Error(
      `Error missing or not matching request state with URL state`,
    );
  }

  const retrievalPromise = doRetrievalAndStore({ rootUrl, taskclusterCode });
  // If rejections are not caught here, a rejection would error a test even if
  // it's caught by an error boundary and asserted in the test. By catching it
  // here, even doing nothing more and still returning the original promise, the
  // test doesn't fail anymore.
  retrievalPromise.catch(() => {});

  return {
    retrievalPromise,
  };
}

export type LoaderReturnValue = ReturnType<typeof loader>;
