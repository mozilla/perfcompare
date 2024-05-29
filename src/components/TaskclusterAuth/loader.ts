import { storeUserCredentials } from '../../logic/credentials-storage';
import {
  retrieveTaskclusterUserCredentials,
  retrieveTaskclusterToken,
} from '../../logic/taskcluster';
import { storeTokenBearer } from '../../logic/token-storage';
import { UserCredentials } from '../../types/types';

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

  const tokenBearer = await retrieveTaskclusterToken(rootUrl, taskclusterCode);

  storeTokenBearer(tokenBearer);

  // fetch access token with token Bearer
  const userCredentials = await retrieveTaskclusterUserCredentials(
    rootUrl,
    tokenBearer.access_token,
  );

  storeUserCredentials({ [rootUrl]: userCredentials } as UserCredentials);

  return userCredentials;
}

export type LoaderReturnValue = Awaited<ReturnType<typeof loader>>;
