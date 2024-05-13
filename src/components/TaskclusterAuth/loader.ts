import {
  retrieveTaskclusterAccessToken,
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

  const tokenBearer = await retrieveTaskclusterToken(rootUrl, taskclusterCode);

  // fetch access token with token Bearer
  const accessToken = await retrieveTaskclusterAccessToken(
    rootUrl,
    tokenBearer.access_token,
  );

  sessionStorage.setItem('userCredentials', JSON.stringify(accessToken));

  return accessToken;
}

export type LoaderReturnValue = Awaited<ReturnType<typeof loader>>;
