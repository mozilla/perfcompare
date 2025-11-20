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

/*
 Basic statistics for base or new.
*/
export type BasicStatItem = {
  mean?: number | null;
  median?: number | null;
  stddev?: number | null;
  stddev_pct?: number | null;
  variance?: number | null;
  count?: number | null;
  min?: number | null;
  max?: number | null;
};

/*
 Basic statistics item for a statistical test (like Shapiro-Wilk or KS test).
*/
export type StatisticsTestItem = {
  test_name: string;
  stat: number | null;
  pvalue: number | null;
  interpretation?: string | null;
} | null;

/*
 KDE plot values for base or new runs.
*/
export type KDEItem = {
  median: number;
  sample_count: number;
  kde_x: number[];
  kde_y: number[];
};

/*
 Common Language Effect Size (CLES) results with Mann-Whitney U test. Interpretation of statistical effect and significance with what level of confidence interval.
*/
export type CLESItem = {
  cles: number;
  cles_direction: string;
  mann_whitney_u_cles: string;
  p_value_cles: string;
  cliffs_delta_cles: string;
  effect_size: string;
  cles_explanation: string;
} | null;

export type ModeItem = {
  mode_name: string;
  mode_start?: string;
  mode_end?: string;
  ci_low?: number | null;
  ci_high?: number | null;
  ci_warning?: string | null;
  shift?: number | null;
  shift_summary?: string | null;
  median_shift_summary?: string | null;
};

/*
  Results from Silverman KDE test for multimodal data.
*/
export type SilvermanKDEItem = {
  bandwidth: string;
  base_mode_count: number;
  new_mode_count: number;
  base_locations: number[];
  new_locations: number[];
  base_prominence: number;
  new_prominence: number;
  warnings: string[];
  modes: ModeItem[];
  is_regression: boolean | null;
  is_improvement: boolean | null;
};

/*
  Results from the Mann-Whitney U test comparing two sets of runs.
*/
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
  delta_value: number;
  delta_percentage: number;
  base_standard_stats: BasicStatItem;
  new_standard_stats: BasicStatItem;
  ks_test: StatisticsTestItem; // Kolmogorov-Smirnov: Test for goodness of fit
  ks_warning?: string | null; // warning about goodness of fit
  shapiro_wilk_test_base: StatisticsTestItem; // Shapiro-Wilk: Normality test
  shapiro_wilk_test_new: StatisticsTestItem; // Shapiro-Wilk: Normality test
  shapiro_wilk_warnings?: string[] | null; // warnings about normality for both base and new
  mann_whitney_test: StatisticsTestItem; // Mann-Whitney-U: Tests the null hypothesis, p-value to display here
  cliffs_delta: number;
  cliffs_interpretation: string;
  cles?: CLESItem; // CLES: Common Language Effect Size, statistical effect interpretation from Mann-Whitney U
  kde_new: KDEItem; // KDE plots and summary plot with ISJ bandwidth for new runs
  kde_base: KDEItem; // KDE plots and summary plot with ISJ bandwidth for base runs
  kde_warnings: string[];
  silverman_warnings?: string[] | null; // silverman warnings about multimodal data
  silverman_kde: SilvermanKDEItem; // Silverman KDE multimodal warnings and confidence interval
  is_fit_good: boolean | null; // short form interpretation of KS test goodness of fit
  is_significant: boolean | null; // is the result statistically significant
  is_new_better: boolean | null; // is the new revision better than the base revision
  performance_intepretation: string; // short text interpretation of the performance change
  direction_of_change: 'no change' | 'improvement' | 'regression' | null;
  new_is_better: boolean | null;
  lower_is_better: boolean | null;
  is_improvement: boolean | null;
  test: string;
  option_name: string;
  extra_options: string;
  graphs_link: string;
  is_regression: boolean | null;
  is_meaningful: boolean | null;
  more_runs_are_needed: boolean | null;
  warning_c_delta?: string | null;
  /*
  Each test has a signature and each signature may or may not have a parent_signature.
  If a signature has a parent_signature then we are looking at a subtest. For regular tests this field will be null.
  */
  base_parent_signature: number | null;
  new_parent_signature: number | null;
  base_signature_id: number;
  new_signature_id: number;
  has_subtests: boolean;
  is_complete: boolean | null;
  // values on CompareResultsItem Type not to be rendered on MannWhitneyResultsItem type
  base_avg_value?: number;
  new_avg_value?: number;
  confidence_text?: ConfidenceText | null;
  confidence?: number;
  base_median_value?: number;
  new_median_value?: number;
};

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
