import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { IconButton } from '@mui/material';

import { checkTaskclusterCredentials } from '../../logic/taskcluster';
import { Strings } from '../../resources/Strings';

function waitForStorageEvent(): Promise<void> {
  return new Promise((resolve) => {
    window.addEventListener(
      'storage',
      function storageListener(event: StorageEvent) {
        // TODO change userCredentials with userTokens
        // when the userCredentials fetch is moved here
        if (event.key === 'userCredentials') {
          resolve();
          window.removeEventListener('storage', storageListener);
        }
      },
    );
  });
}

async function checkLocalStorage() {
  await waitForStorageEvent();
}

function RetriggerButton() {
  const onOpenModal = async () => {
    checkTaskclusterCredentials();
    await checkLocalStorage();
  };

  // TODO implement modal

  return (
    <>
      <IconButton
        title={Strings.components.revisionRow.title.retriggerJobs}
        color='primary'
        size='small'
        onClick={() => void onOpenModal()}
      >
        <RefreshOutlinedIcon />
      </IconButton>
    </>
  );
}

export default RetriggerButton;
