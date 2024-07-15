import {
  storeUserToken,
  storeUserCredentials,
} from '../../logic/credentials-storage';
import {
  retrieveTaskclusterUserCredentials,
  retrieveTaskclusterToken,
} from '../../logic/taskcluster';

export async function loader({ request }: { request: Request }) {
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

  // TODO Use defer values as explained in https://reactrouter.com/en/main/guides/deferred
  // so that the component displays while retrieving all the data
  return userCredentials;
}

export type LoaderReturnValue = Awaited<ReturnType<typeof loader>>;
