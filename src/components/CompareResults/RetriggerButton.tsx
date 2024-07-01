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
  const {
    base_repository_name: baseRepository,
    base_retriggerable_job_ids: baseRetriggerableJobIds,
    new_repository_name: newRepository,
    new_retriggerable_job_ids: newRetriggerableJobIds,
  } = result;

  const onOpenModal = async () => {
    let credentials = getTaskclusterCredentials();
    if (!credentials) {
      await signInIntoTaskcluster();
      credentials = getTaskclusterCredentials();
    }

    const tcParams = getTaskclusterParams();

    const [baseRetriggerTaskId, newRetriggerTaskId] = await Promise.all([
      retrigger({
        rootUrl: tcParams.url,
        repo: baseRepository,
        jobId: baseRetriggerableJobIds[0],
        // TODO decided by the user in the modal
        times: 2,
      }),
      retrigger({
        rootUrl: tcParams.url,
        repo: newRepository,
        jobId: newRetriggerableJobIds[0],
        // TODO decided by the user in the modal
        times: 2,
      }),
    ]);
    console.log('Retrigger taskId for base: ', baseRetriggerTaskId);
    console.log('Retrigger taskId for new: ', newRetriggerTaskId);
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
