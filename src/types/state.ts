import type {
  ConfidenceText,
  Framework,
  MeasurementUnit,
  Platform,
} from './types';

export type Repository =
  | { id: 1; name: 'mozilla-central' }
  | { id: 2; name: 'mozilla-beta' }
  | { id: 3; name: 'mozilla-release' }
  | { id: 4; name: 'try' }
  | { id: 30; name: 'fenix' }
  | { id: 77; name: 'autoland' };

export type SubRevision = {
  result_set_id: number;
  repository_id: number;
  revision: string;
  author: string;
  comments: string;
};

export type Revision = {
  id: number;
  revision: string;
  author: string;
  revisions: SubRevision[];
  revision_count: number;
  push_timestamp: number;
  repository_id: Repository['id'];
};

export type CompareResultsItem = {
  header_name: string;
  base_retriggerable_job_ids: number[];
  new_retriggerable_job_ids: number[];
  base_measurement_unit: MeasurementUnit;
  new_measurement_unit: MeasurementUnit;
  platform: Platform;
  suite: string;
  framework_id: Framework['id'];
  new_repository_name: Repository['name'];
  base_repository_name: Repository['name'];
  new_runs: number[];
  base_runs: number[];
  is_complete: boolean;
  base_avg_value: number;
  new_avg_value: number;
  base_median_value: number;
  new_median_value: number;
  base_stddev: number;
  new_stddev: number;
  base_stddev_pct: number;
  new_stddev_pct: number;
  new_is_better: boolean;
  confidence: number | null;
  confidence_text: ConfidenceText | null;
  confidence_text_long: string | null;
  t_value_confidence: number;
  t_value_care_min: number;
  delta_value: number;
  delta_percentage: number;
  magnitude: number;
  is_improvement: boolean;
  is_empty: boolean;
  test: string;
  option_name: string;
  extra_options: string;
  noise_metric: boolean;
  is_confident: boolean;
  graphs_link: string;
  is_regression: boolean;
  is_meaningful: boolean;
  more_runs_are_needed: boolean;
  description: string;
};

export type SearchState = {
  repository: Repository['name'];
  searchResults: Revision[];
  searchValue: string;
  inputError: boolean;
  inputHelperText: string;
};

// contains the indices of currently checked revisions
// in searchResults state
export type CheckedRevisionsState = {
  revisions: Revision[];
};

export type SelectedRevisionsState = {
  revisions: Revision[];
};

export type CompareResultsState = CompareResultsItem[];
