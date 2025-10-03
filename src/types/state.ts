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

export type SubtestsRevisionsHeader = {
  suite: string;
  framework_id: Framework['id'];
  test: string;
  option_name: string;
  extra_options: string;
  new_rev: string;
  new_repo: Repository['name'];
  base_rev: string;
  base_repo: Repository['name'];
  base_parent_signature: number | null;
  new_parent_signature: number | null;
  platform: Platform;
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
  new_runs_replicates: number[];
  base_runs_replicates: number[];
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
  lower_is_better: boolean;
  confidence: number | null;
  confidence_text: ConfidenceText | null;
  delta_value: number;
  delta_percentage: number;
  magnitude: number;
  is_improvement: boolean;
  test: string;
  option_name: string;
  extra_options: string;
  noise_metric: boolean;
  is_confident: boolean;
  graphs_link: string;
  is_regression: boolean;
  is_meaningful: boolean;
  more_runs_are_needed: boolean;
  /*
  Each test has a signature and each signature may or may not have a parent_signature.
  If a signature has a parent_signature then we are looking at a subtest. For regular tests this field will be null.
  */
  base_parent_signature: number | null;
  new_parent_signature: number | null;
  base_signature_id: number;
  new_signature_id: number;
  has_subtests: boolean;
};

export type BasicStatItem = {
  mean: number;
  median: number;
  stddev: number;
  stddev_pct: number;
  variance: number;
  count: number;
  min: number;
  max: number;
};

export type StatisticsTestItem = {
  name: string;
  stat: number;
  pvalue: number;
  interpretation: string;
}

export type KDEItem = {
  median: number;
  sample_count: number;
  kde_x: number[];
  kde_y: number[];
}

export type CLESItem = {
  cles: number;
  cles_direction: string;
  mann_whitney_u_cles: string,
  p_value_cles: string;
  cliffs_delta_cles: string;
  effect_size: string;
  cles_explanation: string;
}

export type MannWhitneyResultsItem = {
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
  new_runs_replicates: number[];
  base_runs_replicates: number[];
  base_standard_stats: BasicStatItem;
  new_standard_stats: BasicStatItem;
  ks_test: StatisticsTestItem;
  shapiro_wilk_test_base: StatisticsTestItem;
  shapiro_wilk_test_new: StatisticsTestItem;
  shapiro_wilk_warnings: string[];
  mann_whitney_test: StatisticsTestItem; // p-value here
  cliffs_delta: number;
  cliffs_interpretation: string;
  cles?: CLESItem;
  kde_new: KDEItem;
  kde_base: KDEItem;
  kde_summary_text: string[];
  new_is_better: boolean;
  lower_is_better: boolean;
  is_improvement: boolean;
  test: string;
  option_name: string;
  extra_options: string;
  graphs_link: string;
  is_regression: boolean;
  is_meaningful: boolean;
  more_runs_are_needed: boolean;
  /*
  Each test has a signature and each signature may or may not have a parent_signature.
  If a signature has a parent_signature then we are looking at a subtest. For regular tests this field will be null.
  */
  base_parent_signature: number | null;
  new_parent_signature: number | null;
  base_signature_id: number;
  new_signature_id: number;
  has_subtests: boolean;
};

export type CompareResultItemType = CompareResultsItem &
  MannWhitneyResultsItem;

export type HashToCommit = {
  baseRevision: string;
  newRevision: string;
};

export type LandoToCommit = {
  commit_id: string;
  id: string;
  status: string;
};

export type InputType = 'base' | 'new';

export type ThemeMode = 'light' | 'dark';

export type SelectedRevisionsState = {
  revisions: Changeset[];
  baseCommittedRevisions: Changeset[];
  newCommittedRevisions: Changeset[];
};

export type PlatformShortName =
  | 'Linux'
  | 'macOS'
  | 'Windows'
  | 'Android'
  | 'iOS'
  | 'Unspecified';

export type TestVersionName = 'mann-whitney-u' | 'student-t';
