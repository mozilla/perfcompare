import { Suspense } from 'react';

import { Typography, Box, CircularProgress } from '@mui/material';
import { useLoaderData, Await } from 'react-router';

import { LoaderReturnValue } from './loader';

function WaitingForCredentials() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 3,
        margin: 3,
      }}
    >
      <Typography variant='h2' component='h2'>
        Retrieving Taskcluster credentials...
      </Typography>
      <CircularProgress />
    </Box>
  );
}

function CredentialsFound() {
  return (
    <>
      {/* This won't be shown because the window closes after the promise resolves,
          but is useful for tests. */}
      Credentials were found!
    </>
  );
}

export default function TaskclusterCallback() {
  const { retrievalPromise } = useLoaderData() as LoaderReturnValue;

  return (
    <>
      <Suspense fallback={<WaitingForCredentials />}>
        <Await resolve={retrievalPromise}>
          <CredentialsFound />
        </Await>
      </Suspense>
    </>
  );
}
