import { tcClientIdMap } from '../../logic/taskcluster';
import { getLocationOrigin } from '../../utils/location';

interface RequestOptions {
  method: string;
  body: string;
  headers: {
    'Content-Type': string;
  };
}

interface ResponseToken {
  access_token: string;
  token_type: 'Bearer';
}

const fetchData = async (url: string, options: RequestOptions) => {
  const response = await fetch(url, options);

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error(
        `Error when requesting Taskcluster: ${await response.text()}`,
      );
    } else {
      throw new Error(
        `Error when requesting Taskcluster: (${response.status}) ${response.statusText}`,
      );
    }
  }

  return response.json() as Promise<ResponseToken>;
};

export async function loader({ request }: { request: Request }) {
  const tcAuthCallbackUrl = '/taskcluster-auth';
  const redirectURI = `${window.location.origin}${tcAuthCallbackUrl}`;

  const locationOrigin = getLocationOrigin();
  const clientId = tcClientIdMap[locationOrigin];

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

  // fetch token Bearer, it will be used to fetch the access_token
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: taskclusterCode,
    redirect_uri: redirectURI,
    client_id: clientId,
  });

  const options: RequestOptions = {
    method: 'POST',
    body: body.toString(),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  };

  // fetch token Bearer
  const response = await fetchData(`${rootUrl}/login/oauth/token`, options);

  // TODO fetch access token with token Bearer

  return response;
}

export type LoaderReturnValue = Awaited<ReturnType<typeof loader>>;
