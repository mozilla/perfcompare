import type { Repository, Changeset } from './state';

type APIFilterParams = {
  full: boolean;
  count: number;
};

type APIPushMeta = {
  count: number;
  repository: Repository['name'];
  filter_params: APIFilterParams;
};

export type APIPushResponse = {
  meta: APIPushMeta;
  results: Changeset[];
};

export type JobInformation = {
  build_architecture: string;
  build_os: string;
  build_platform: string;
  build_platform_id: number;
  build_system_type: 'taskcluster';
  end_timestamp: number;
  failure_classification_id: number; // probably an enum
  id: number;
  job_group_description: string;
  job_group_id: number;
  job_group_name: string;
  job_group_symbol: string;
  job_guid: string;
  job_type_description: string;
  job_type_id: number;
  job_type_name: string;
  job_type_symbol: string;
  last_modified: string;
  machine_name: string;
  machine_platform_architecture: string;
  machine_platform_os: string;
  option_collection_hash: string;
  platform: string;
  push_id: number;
  reason: string; // probably an enum
  ref_data_name: string;
  result: string; // probably an enum
  result_set_id: number;
  signature: string;
  start_timestamp: number;
  state: string; // probably an enum
  submit_timestamp: number;
  tier: 1 | 2 | 3;
  who: string;
  resource_uri: string;
  logs: Array<{ name: string; url: string }>;
  platform_option: string;
  task_id: string;
  retry_id: number;
  taskcluster_metadata: { task_id: string; retry_id: number };
};
