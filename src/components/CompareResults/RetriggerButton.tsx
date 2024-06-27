import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { IconButton } from '@mui/material';

import {
  getTaskclusterCredentials,
  getTaskclusterParams,
  retrigger,
  signInIntoTaskcluster,
} from '../../logic/taskcluster';
import { Strings } from '../../resources/Strings';
import { CompareResultsItem } from '../../types/state';

function RetriggerButton(props: RetriggerButtonProps) {
  const { result } = props;
  // Consider the retrigger just for base for now
  const {
    base_repository_name: baseRepository,
    base_retriggerable_job_ids: baseRetriggerableJobIds,
  } = result;

  const onOpenModal = async () => {
    let credentials = getTaskclusterCredentials();
    if (!credentials) {
      await signInIntoTaskcluster();
      credentials = getTaskclusterCredentials();
      // Check if it's the right url
      const tcParams = getTaskclusterParams();
      await retrigger(tcParams.url, baseRepository, baseRetriggerableJobIds[0]);
    }

    console.log('We have an access token!', credentials);
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

interface RetriggerButtonProps {
  result: CompareResultsItem;
}

export default RetriggerButton;
