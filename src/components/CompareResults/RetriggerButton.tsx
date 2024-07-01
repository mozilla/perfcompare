import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { IconButton } from '@mui/material';

import {
  getTaskclusterCredentials,
  getTaskclusterParams,
  retrigger,
  signInIntoTaskcluster,
} from '../../logic/taskcluster';
import {
  fetchDecisionTaskIdFromPushId,
  fetchJobInformationFromJobId,
} from '../../logic/treeherder';
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

  const getRetriggerConfig = async (repository: string, jobId: number) => {
    const tcParams = getTaskclusterParams();

    const jobInfo = await fetchJobInformationFromJobId(repository, jobId);
    const decisionTaskId = await fetchDecisionTaskIdFromPushId(
      repository,
      jobInfo.push_id,
    );

    const config = {
      rootUrl: tcParams.url,
      jobInfo,
      decisionTaskId,
      // TODO decided by the user in the modal
      times: 2,
    };

    return config;
  };

  const onOpenModal = async () => {
    let credentials = getTaskclusterCredentials();
    if (!credentials) {
      await signInIntoTaskcluster();
      credentials = getTaskclusterCredentials();
    }

    const baseRetriggerConfig = await getRetriggerConfig(
      baseRepository,
      baseRetriggerableJobIds[0],
    );

    const newRetriggerConfig = await getRetriggerConfig(
      newRepository,
      newRetriggerableJobIds[0],
    );

    const [baseRetriggerTaskId, newRetriggerTaskId] = await Promise.all([
      retrigger(baseRetriggerConfig),
      retrigger(newRetriggerConfig),
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
