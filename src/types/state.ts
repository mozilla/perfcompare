import type {
  ConfidenceText,
  Framework,
  MeasurementUnit,
  Platform,
} from './types';

export type Repository =
  | { id: 1; name: 'mozilla-central' }
  | { id: 4; name: 'try' }
  | { id: 6; name: 'mozilla-beta' }
  | { id: 7; name: 'mozilla-release' }
  | { id: 77; name: 'autoland' }
  | { id: 108; name: 'fenix' };

export type SubRevision = {
  result_set_id: number;
  repository_id: number;
  revision: string;
  author: string;
  comments: string;
};

export type Changeset = {
  id: number;
  revision: string;
  author: string;
  revisions: SubRevision[];
  revision_count: number;
  push_timestamp: number;
  repository_id: Repository['id'];
};

export type RevisionsData = {
  suite: string;
  test: string;
  option_name: string;
  extra_options: string;
};

export type RevisionsHeader = {
  suite: string;
  framework_id: Framework['id'];
  test: string;
  option_name: string;
  extra_options: string;
  new_rev: string;
  new_repo: Repository['name'];
};

export type CompareResultsItem = {
  base_rev: string;
  new_rev: string;
  base_app: string;
  new_app: string;
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
};

export type SearchStateForInput = {
  repository: Repository['name'];
  searchResults: Changeset[];
  searchValue: string;
  inputError: boolean;
  inputHelperText: string;
};

export type InputType = 'base' | 'new';

export type View = 'compare-results' | 'search';

export type ThemeMode = 'light' | 'dark';

export type SearchState = Record<InputType, SearchStateForInput>;

export type SelectedRevisionsState = {
  revisions: Changeset[];
  baseCommittedRevisions: Changeset[];
  newCommittedRevisions: Changeset[];
};

export type PlatformInfo = {
  shortName: string;
  icon: React.ReactNode;
};
