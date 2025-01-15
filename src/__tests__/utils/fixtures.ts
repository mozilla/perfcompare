import type { CompareResultsItem, Changeset } from '../../types/state';

const getTestData = () => {
  const testData: Changeset[] = [
    {
      id: 1,
      revision: 'coconut',
      author: 'johncleese@python.com',
      revisions: [
        {
          result_set_id: 0,
          repository_id: 4,
          revision: 'coconut',
          author: 'johncleese@python.com',
          comments: "you've got no arms left!\n",
        },
      ],
      revision_count: 1,
      push_timestamp: -592099200,
      repository_id: 4,
    },
    {
      id: 2,
      revision: 'spam',
      author: 'ericidle@python.com',
      revisions: [
        {
          result_set_id: 1,
          repository_id: 1,
          revision: 'spam',
          author: 'ericidle@python.com',
          comments: "it's just a flesh wound\n",
        },
      ],
      revision_count: 1,
      push_timestamp: -374198400,
      repository_id: 1,
    },
    {
      id: 3,
      revision: 'spamspam',
      author: 'terrygilliam@python.com',
      revisions: [
        {
          result_set_id: 2,
          repository_id: 4,
          revision: 'coconut',
          author: 'terrygilliam@python.com',
          comments: 'What, ridden on a horse?\n',
        },
      ],
      revision_count: 1,
      push_timestamp: 554515200,
      repository_id: 4,
    },
    {
      id: 4,
      revision: 'spamspamspamandeggs',
      author: 'michaelpalin@python.com',
      revisions: [
        {
          result_set_id: 3,
          repository_id: 77,
          revision: 'spam',
          author: 'michaelpalin@python.com',
          comments:
            "You've got two empty 'alves of coconuts and you're bangin' 'em togetha!",
        },
      ],
      revision_count: 1,
      push_timestamp: 1593820800,
      repository_id: 77,
    },
    {
      id: 5,
      revision: 'spamspamspamspamandeggs',
      author: 'grahamchapman@python.com',
      revisions: [
        {
          result_set_id: 4,
          repository_id: 77,
          revision: 'spam',
          author: 'grahamchapman@python.com',
          comments: 'She turned me into a newt!\n',
        },
        {
          result_set_id: 4,
          repository_id: 77,
          revision: 'spam',
          author: 'grahamchapman@python.com',
          comments: 'It got better...\n',
        },
      ],
      revision_count: 1,
      push_timestamp: 1649808000,
      repository_id: 77,
    },
  ];

  const testCompareData: CompareResultsItem[] = [
    {
      base_rev: 'coconut',
      new_rev: 'spam',
      base_app: '',
      new_app: '',
      framework_id: 1,
      platform: 'macosx1015-64-shippable-qr',
      suite: 'a11yr',
      header_name: 'a11yr dhtml.html opt e10s fission stylo webrender',
      base_repository_name: 'mozilla-central',
      new_repository_name: 'mozilla-central',
      is_complete: true,
      base_measurement_unit: 'ms',
      new_measurement_unit: 'ms',
      base_retriggerable_job_ids: [381594973],
      new_retriggerable_job_ids: [381452501],
      base_runs: [704.84],
      new_runs: [712.44],
      base_runs_replicates: [],
      new_runs_replicates: [],
      base_avg_value: 704.84,
      new_avg_value: 712.44,
      base_median_value: 704.84,
      new_median_value: 712.44,
      test: 'dhtml.html',
      option_name: 'opt',
      extra_options: 'e10s fission stylo webrender',
      base_stddev: 0.0,
      new_stddev: 0.0,
      base_stddev_pct: 0.0,
      new_stddev_pct: 0.0,
      confidence: 0.05,
      confidence_text: 'Low',
      graphs_link:
        'https://treeherder.mozilla.org/perfherder/graphs?highlightedRevisions=1e32960788ea&highlightedRevisions=6a1f133815a1&series=mozilla-central%2C9daea6258ae244039eb2390f3eab7935994cbb0e%2C1%2C1&timerange=5184000',
      delta_value: 7.6,
      delta_percentage: 1.08,
      magnitude: 5.39,
      new_is_better: false,
      lower_is_better: true,
      is_confident: false,
      more_runs_are_needed: true,
      noise_metric: false,
      is_improvement: true,
      is_regression: false,
      is_meaningful: true,
      base_parent_signature: null,
      new_parent_signature: null,
      base_signature_id: 12345,
      new_signature_id: 12345,
      has_subtests: false,
    },
    {
      base_rev: 'coconut',
      new_rev: 'spam',
      base_app: '',
      new_app: '',
      framework_id: 1,
      platform: 'linux1804-64-shippable-qr',
      suite: 'a11yr',
      header_name: 'a11yr dhtml.html opt e10s fission stylo webrender',
      base_repository_name: 'mozilla-central',
      new_repository_name: 'mozilla-central',
      is_complete: true,
      base_measurement_unit: 'ms',
      new_measurement_unit: 'ms',
      base_retriggerable_job_ids: [381587080],
      new_retriggerable_job_ids: [381451522],
      base_runs: [776.97],
      new_runs: [791.34],
      base_runs_replicates: [],
      new_runs_replicates: [],
      base_avg_value: 776.97,
      new_avg_value: 791.34,
      base_median_value: 776.97,
      new_median_value: 791.34,
      test: 'dhtml.html',
      option_name: 'opt',
      extra_options: 'e10s fission stylo webrender',
      base_stddev: 0.0,
      new_stddev: 0.0,
      base_stddev_pct: 0.0,
      new_stddev_pct: 0.0,
      confidence: 0.09,
      confidence_text: 'Medium',
      graphs_link:
        'https://treeherder.mozilla.org/perfherder/graphs?highlightedRevisions=1e32960788ea&highlightedRevisions=6a1f133815a1&series=mozilla-central%2Cedcc6311f15bdf7924ef3f0ccfd8b47ce1892212%2C1%2C1&timerange=5184000',
      delta_value: 14.37,
      delta_percentage: 1.85,
      magnitude: 9.25,
      new_is_better: false,
      lower_is_better: true,
      is_confident: false,
      more_runs_are_needed: true,
      noise_metric: false,
      is_improvement: false,
      is_regression: true,
      is_meaningful: true,
      base_parent_signature: null,
      new_parent_signature: null,
      base_signature_id: 12345,
      new_signature_id: 12345,
      has_subtests: false,
    },
    {
      base_rev: 'coconut',
      new_rev: 'spam',
      base_app: '',
      new_app: '',
      framework_id: 1,
      platform: 'windows10-64-shippable-qr',
      suite: 'a11yr',
      header_name: 'a11yr dhtml.html opt e10s fission stylo webrender',
      base_repository_name: 'mozilla-central',
      new_repository_name: 'mozilla-central',
      is_complete: true,
      base_measurement_unit: 'ms',
      new_measurement_unit: 'ms',
      base_retriggerable_job_ids: [381588467],
      new_retriggerable_job_ids: [381453172],
      base_runs: [643.54],
      new_runs: [628.09],
      base_runs_replicates: [],
      new_runs_replicates: [],
      base_avg_value: 643.54,
      new_avg_value: 628.09,
      base_median_value: 643.54,
      new_median_value: 628.09,
      test: 'dhtml.html',
      option_name: 'opt',
      extra_options: 'e10s fission stylo webrender',
      base_stddev: 0.0,
      new_stddev: 0.0,
      base_stddev_pct: 0.0,
      new_stddev_pct: 0.0,
      confidence: 0.11,
      confidence_text: 'High',
      graphs_link:
        'https://treeherder.mozilla.org/perfherder/graphs?highlightedRevisions=1e32960788ea&highlightedRevisions=6a1f133815a1&series=mozilla-central%2C3a6d4b6178678c3113c980b378bb83b2629926a0%2C1%2C1&timerange=5184000',
      delta_value: -15.46,
      delta_percentage: -2.4,
      magnitude: 12.01,
      new_is_better: true,
      lower_is_better: true,
      is_confident: false,
      more_runs_are_needed: true,
      noise_metric: false,
      is_improvement: false,
      is_regression: false,
      is_meaningful: true,
      base_parent_signature: null,
      new_parent_signature: null,
      base_signature_id: 12345,
      new_signature_id: 12345,
      has_subtests: false,
    },
    {
      base_rev: 'coconut',
      new_rev: 'spam',
      base_app: '',
      new_app: '',
      framework_id: 1,
      platform: 'windows10-64-qr',
      suite: 'a11yr',
      header_name: 'a11yr dhtml.html opt e10s fission stylo webrender',
      base_repository_name: 'mozilla-central',
      new_repository_name: 'mozilla-central',
      is_complete: true,
      base_measurement_unit: 'ms',
      new_measurement_unit: 'ms',
      base_retriggerable_job_ids: [381588467],
      new_retriggerable_job_ids: [381453172],
      base_runs: [643.54],
      new_runs: [628.09],
      base_runs_replicates: [],
      new_runs_replicates: [],
      base_avg_value: 643.54,
      new_avg_value: 628.09,
      base_median_value: 643.54,
      new_median_value: 628.09,
      test: 'dhtml.html',
      option_name: 'opt',
      extra_options: 'e10s fission stylo webrender',
      base_stddev: 0.0,
      new_stddev: 0.0,
      base_stddev_pct: 0.0,
      new_stddev_pct: 0.0,
      confidence: 0.45,
      confidence_text: null,
      graphs_link:
        'https://treeherder.mozilla.org/perfherder/graphs?highlightedRevisions=1e32960788ea&highlightedRevisions=6a1f133815a1&series=mozilla-central%2C3a6d4b6178678c3113c980b378bb83b2629926a0%2C1%2C1&timerange=5184000',
      delta_value: -154.6,
      delta_percentage: -24,
      magnitude: 12.01,
      new_is_better: true,
      lower_is_better: true,
      is_confident: false,
      more_runs_are_needed: true,
      noise_metric: false,
      is_improvement: false,
      is_regression: false,
      is_meaningful: true,
      base_parent_signature: null,
      new_parent_signature: null,
      base_signature_id: 12345,
      new_signature_id: 12345,
      has_subtests: false,
    },
  ];

  const testCompareDataWithMultipleRuns = [
    {
      base_rev: '3639b6891b332ea6c4ffea87bb2d1139c38b781d',
      new_rev: '9d50665254899d8431813bdc04178e6006ce6d59',
      base_app: 'firefox',
      new_app: 'chrome',
      framework_id: 1,
      platform: 'linux1804-64-shippable-qr',
      suite: 'a11yr',
      header_name: 'a11yr opt e10s fission stylo webrender',
      base_repository_name: 'mozilla-central',
      new_repository_name: 'mozilla-central',
      is_complete: true,
      base_measurement_unit: null,
      new_measurement_unit: null,
      base_retriggerable_job_ids: [411967296, 411967295, 411967298, 411967310],
      new_retriggerable_job_ids: [
        411832360, 412140455, 412140456, 412140457, 412140458,
      ],
      base_runs: [587.15, 593.04, 600.7, 602.04],
      new_runs: [605.16, 605.31, 605.61, 605.81, 607.27],
      base_runs_replicates: [],
      new_runs_replicates: [],
      base_avg_value: 595.73,
      new_avg_value: 605.83,
      base_median_value: 596.87,
      new_median_value: 605.61,
      test: '',
      option_name: 'opt',
      extra_options: 'e10s fission stylo webrender',
      base_stddev: 6.96,
      new_stddev: 0.84,
      base_stddev_pct: 1.17,
      new_stddev_pct: 0.14,
      confidence: 2.89,
      confidence_text: 'Low',
      graphs_link:
        'https://treeherder.mozilla.org/perfherder/graphs?highlightedRevisions=25045b498bff&highlightedRevisions=927bacde5bed&series=mozilla-central%2Cbb90e3cd08f31ec87726e9c68e8a2927d484419d%2C1%2C1&timerange=604800',
      delta_value: 10.1,
      delta_percentage: 1.7,
      magnitude: 8.48,
      new_is_better: false,
      lower_is_better: true,
      is_confident: false,
      more_runs_are_needed: true,
      noise_metric: false,
      is_improvement: false,
      is_regression: false,
      is_meaningful: true,
    },
  ];

  const testCompareDataWithReplicates = [
    {
      base_rev: '3639b6891b332ea6c4ffea87bb2d1139c38b781d',
      new_rev: '9d50665254899d8431813bdc04178e6006ce6d59',
      base_app: 'firefox',
      new_app: 'chrome',
      framework_id: 1,
      platform: 'linux1804-64-shippable-qr',
      suite: 'a11yr',
      header_name: 'a11yr opt e10s fission stylo webrender',
      base_repository_name: 'mozilla-central',
      new_repository_name: 'mozilla-central',
      is_complete: true,
      base_measurement_unit: null,
      new_measurement_unit: null,
      base_retriggerable_job_ids: [411967296, 411967295, 411967298, 411967310],
      new_retriggerable_job_ids: [
        411832360, 412140455, 412140456, 412140457, 412140458,
      ],
      base_runs: [587.15, 587.15],
      new_runs: [605.16, 587.15],
      base_runs_replicates: [587.15, 593.04, 600.7, 602.04],
      new_runs_replicates: [605.16, 605.31, 605.61, 605.81, 607.27],
      base_avg_value: 595.73,
      new_avg_value: 605.83,
      base_median_value: 596.87,
      new_median_value: 605.61,
      test: '',
      option_name: 'opt',
      extra_options: 'e10s fission stylo webrender',
      base_stddev: 6.96,
      new_stddev: 0.84,
      base_stddev_pct: 1.17,
      new_stddev_pct: 0.14,
      confidence: 2.89,
      confidence_text: 'Low',
      graphs_link:
        'https://treeherder.mozilla.org/perfherder/graphs?highlightedRevisions=25045b498bff&highlightedRevisions=927bacde5bed&series=mozilla-central%2Cbb90e3cd08f31ec87726e9c68e8a2927d484419d%2C1%2C1&timerange=604800',
      delta_value: 10.1,
      delta_percentage: 1.7,
      magnitude: 8.48,
      new_is_better: false,
      lower_is_better: true,
      is_confident: false,
      more_runs_are_needed: true,
      noise_metric: false,
      is_improvement: false,
      is_regression: false,
      is_meaningful: true,
    },
  ];

  const testCompareDataWithReplicatesOneValue = [
    {
      base_rev: '3639b6891b332ea6c4ffea87bb2d1139c38b781d',
      new_rev: '9d50665254899d8431813bdc04178e6006ce6d59',
      base_app: 'firefox',
      new_app: 'chrome',
      framework_id: 1,
      platform: 'linux1804-64-shippable-qr',
      suite: 'a11yr',
      header_name: 'a11yr opt e10s fission stylo webrender',
      base_repository_name: 'mozilla-central',
      new_repository_name: 'mozilla-central',
      is_complete: true,
      base_measurement_unit: null,
      new_measurement_unit: null,
      base_retriggerable_job_ids: [411967296, 411967295, 411967298, 411967310],
      new_retriggerable_job_ids: [
        411832360, 412140455, 412140456, 412140457, 412140458,
      ],
      base_runs: [587.15],
      new_runs: [605.16],
      base_runs_replicates: [587.15, 593.04, 600.7, 602.04],
      new_runs_replicates: [605.16, 605.31, 605.61, 605.81, 607.27],
      base_avg_value: 595.73,
      new_avg_value: 605.83,
      base_median_value: 596.87,
      new_median_value: 605.61,
      test: '',
      option_name: 'opt',
      extra_options: 'e10s fission stylo webrender',
      base_stddev: 6.96,
      new_stddev: 0.84,
      base_stddev_pct: 1.17,
      new_stddev_pct: 0.14,
      confidence: 2.89,
      confidence_text: 'Low',
      graphs_link:
        'https://treeherder.mozilla.org/perfherder/graphs?highlightedRevisions=25045b498bff&highlightedRevisions=927bacde5bed&series=mozilla-central%2Cbb90e3cd08f31ec87726e9c68e8a2927d484419d%2C1%2C1&timerange=604800',
      delta_value: 10.1,
      delta_percentage: 1.7,
      magnitude: 8.48,
      new_is_better: false,
      lower_is_better: true,
      is_confident: false,
      more_runs_are_needed: true,
      noise_metric: false,
      is_improvement: false,
      is_regression: false,
      is_meaningful: true,
    },
  ];

  const subtestsResult: CompareResultsItem[] = [
    {
      base_rev: 'd775409d7c6abb76362a3430e9880ec032ad4679',
      new_rev: '22f4cf67e8ad76b5ab2a00b97837d1d920b8c2b7',
      base_app: 'firefox',
      new_app: 'firefox',
      framework_id: 1,
      platform: 'linux1804-64-shippable-qr',
      suite: 'a11yr',
      header_name: 'a11yr dhtml.html opt e10s fission stylo webrender',
      base_repository_name: 'mozilla-central',
      new_repository_name: 'mozilla-central',
      is_complete: true,
      base_measurement_unit: 'ms',
      new_measurement_unit: 'ms',
      base_retriggerable_job_ids: [469521067, 469843701],
      new_retriggerable_job_ids: [469707477, 469843700],
      base_runs: [964.52, 978.24],
      new_runs: [977.16, 987.66],
      base_avg_value: 971.38,
      new_avg_value: 982.41,
      base_median_value: 971.38,
      new_median_value: 982.41,
      test: 'dhtml.html',
      option_name: 'opt',
      extra_options: 'e10s fission stylo webrender',
      base_stddev: 9.7,
      new_stddev: 7.42,
      base_stddev_pct: 1.0,
      new_stddev_pct: 0.76,
      confidence: 1.28,
      confidence_text: 'Low',
      graphs_link:
        'https://treeherder.mozilla.org/perfherder/graphs?highlightedRevisions=d775409d7c6a&highlightedRevisions=22f4cf67e8ad&series=mozilla-central%2C5c47b31c38f7214a07fad2e0d41fb901cdc18eae%2C1%2C1&timerange=604800',
      delta_value: 11.03,
      delta_percentage: 1.14,
      magnitude: 5.68,
      new_is_better: false,
      lower_is_better: true,
      is_confident: false,
      more_runs_are_needed: true,
      noise_metric: false,
      is_improvement: false,
      is_regression: false,
      is_meaningful: true,
      base_parent_signature: 4769486,
      new_parent_signature: 4769486,
      base_signature_id: 4769487,
      new_signature_id: 4769487,
      has_subtests: false,
      new_runs_replicates: [],
      base_runs_replicates: [],
    },
    {
      base_rev: 'd775409d7c6abb76362a3430e9880ec032ad4679',
      new_rev: '22f4cf67e8ad76b5ab2a00b97837d1d920b8c2b7',
      base_app: 'firefox',
      new_app: 'firefox',
      framework_id: 1,
      platform: 'linux1804-64-shippable-qr',
      suite: 'a11yr',
      header_name: 'a11yr tablemutation.html opt e10s fission stylo webrender',
      base_repository_name: 'mozilla-central',
      new_repository_name: 'mozilla-central',
      is_complete: true,
      base_measurement_unit: 'ms',
      new_measurement_unit: 'ms',
      base_retriggerable_job_ids: [469521067, 469843701],
      new_retriggerable_job_ids: [469707477, 469843700],
      base_runs: [312.44, 320.26],
      new_runs: [315.78, 323.12],
      base_avg_value: 316.35,
      new_avg_value: 319.45,
      base_median_value: 316.35,
      new_median_value: 319.45,
      test: 'tablemutation.html',
      option_name: 'opt',
      extra_options: 'e10s fission stylo webrender',
      base_stddev: 5.53,
      new_stddev: 5.19,
      base_stddev_pct: 1.75,
      new_stddev_pct: 1.62,
      confidence: 0.58,
      confidence_text: 'Low',
      graphs_link:
        'https://treeherder.mozilla.org/perfherder/graphs?highlightedRevisions=d775409d7c6a&highlightedRevisions=22f4cf67e8ad&series=mozilla-central%2Ccc1b54585c7d1baaadf9d23164e2ad31c9cb07a3%2C1%2C1&timerange=604800',
      delta_value: 3.1,
      delta_percentage: 0.98,
      magnitude: 4.89,
      new_is_better: false,
      lower_is_better: true,
      is_confident: false,
      more_runs_are_needed: true,
      noise_metric: false,
      is_improvement: false,
      is_regression: false,
      is_meaningful: true,
      base_parent_signature: 4769486,
      new_parent_signature: 4769486,
      base_signature_id: 4769488,
      new_signature_id: 4769488,
      has_subtests: false,
      new_runs_replicates: [],
      base_runs_replicates: [],
    },
    {
      base_rev: 'd775409d7c6abb76362a3430e9880ec032ad4679',
      new_rev: '22f4cf67e8ad76b5ab2a00b97837d1d920b8c2b7',
      base_app: 'firefox',
      new_app: 'firefox',
      framework_id: 1,
      platform: 'linux1804-64-shippable-qr',
      suite: 'a11yr',
      header_name: 'a11yr regression.html opt e10s fission stylo webrender',
      base_repository_name: 'mozilla-central',
      new_repository_name: 'mozilla-central',
      is_complete: true,
      base_measurement_unit: 'ms',
      new_measurement_unit: 'ms',
      base_retriggerable_job_ids: [469521067, 469843701],
      new_retriggerable_job_ids: [469707477, 469843700],
      base_runs: [964.52, 978.24],
      new_runs: [977.16, 987.66],
      base_avg_value: 971.38,
      new_avg_value: 982.41,
      base_median_value: 971.38,
      new_median_value: 982.41,
      test: 'regression.html',
      option_name: 'opt',
      extra_options: 'e10s fission stylo webrender',
      base_stddev: 9.7,
      new_stddev: 7.42,
      base_stddev_pct: 1.0,
      new_stddev_pct: 0.76,
      confidence: 5.79,
      confidence_text: 'High',
      graphs_link:
        'https://treeherder.mozilla.org/perfherder/graphs?highlightedRevisions=d775409d7c6a&highlightedRevisions=22f4cf67e8ad&series=mozilla-central%2C5c47b31c38f7214a07fad2e0d41fb901cdc18eae%2C1%2C1&timerange=604800',
      delta_value: 10.03,
      delta_percentage: 1.04,
      magnitude: 5.68,
      new_is_better: false,
      lower_is_better: true,
      is_confident: false,
      more_runs_are_needed: true,
      noise_metric: false,
      is_improvement: false,
      is_regression: true,
      is_meaningful: true,
      base_parent_signature: 4769486,
      new_parent_signature: 4769486,
      base_signature_id: 4769487,
      new_signature_id: 4769487,
      has_subtests: false,
      new_runs_replicates: [],
      base_runs_replicates: [],
    },
    {
      base_rev: 'd775409d7c6abb76362a3430e9880ec032ad4679',
      new_rev: '22f4cf67e8ad76b5ab2a00b97837d1d920b8c2b7',
      base_app: 'firefox',
      new_app: 'firefox',
      framework_id: 1,
      platform: 'linux1804-64-shippable-qr',
      suite: 'a11yr',
      header_name: 'a11yr improvement.html opt e10s fission stylo webrender',
      base_repository_name: 'mozilla-central',
      new_repository_name: 'mozilla-central',
      is_complete: true,
      base_measurement_unit: 'ms',
      new_measurement_unit: 'ms',
      base_retriggerable_job_ids: [469521067, 469843701],
      new_retriggerable_job_ids: [469707477, 469843700],
      base_runs: [964.52, 978.24],
      new_runs: [977.16, 987.66],
      base_avg_value: 971.38,
      new_avg_value: 982.41,
      base_median_value: 971.38,
      new_median_value: 982.41,
      test: 'improvement.html',
      option_name: 'opt',
      extra_options: 'e10s fission stylo webrender',
      base_stddev: 9.7,
      new_stddev: 7.42,
      base_stddev_pct: 1.0,
      new_stddev_pct: 0.76,
      confidence: 1.45,
      confidence_text: 'Low',
      graphs_link:
        'https://treeherder.mozilla.org/perfherder/graphs?highlightedRevisions=d775409d7c6a&highlightedRevisions=22f4cf67e8ad&series=mozilla-central%2C5c47b31c38f7214a07fad2e0d41fb901cdc18eae%2C1%2C1&timerange=604800',
      delta_value: -13.03,
      delta_percentage: -1.44,
      magnitude: 5.68,
      new_is_better: false,
      lower_is_better: true,
      is_confident: false,
      more_runs_are_needed: true,
      noise_metric: false,
      is_improvement: true,
      is_regression: false,
      is_meaningful: true,
      base_parent_signature: 4769486,
      new_parent_signature: 4769486,
      base_signature_id: 4769487,
      new_signature_id: 4769487,
      has_subtests: false,
      new_runs_replicates: [],
      base_runs_replicates: [],
    },
  ];

  return {
    testCompareData,
    subtestsResult,
    testData,
    testCompareDataWithMultipleRuns,
    testCompareDataWithReplicates,
    testCompareDataWithReplicatesOneValue,
  };
};
export default getTestData;

// This function is used to reduce the number of digits after doing calculations
// on floats, so that we don't end up in a large count of digits in the UI.
// In the future we'll probably want to handle that when rendering the UI instead.
function roundAtDigit(val: number, digit: number) {
  const multiplier = Math.pow(10, digit);
  return Math.round(val * multiplier) / multiplier;
}

// This function takes an array of result items, and adds to it a copy of these
// items where the test name is changed. It also changes the delta and
// confidence values so that a sorting operation can distinguish them.
export function augmentCompareDataWithSeveralTests(
  testCompareData: CompareResultsItem[],
): CompareResultsItem[] {
  const testCompareDataWithSeveralTests = [
    ...testCompareData,
    // Add items with the same revision but a different test
    ...testCompareData.map((item) => ({
      ...item,
      test: 'aria.html',
      header_name: `${item.suite} aria.html ${item.option_name} ${item.extra_options}`,
      // Different delta and confidence values, with some arbitrary changes
      delta_value: item.delta_value + 1.2,
      delta_percentage: roundAtDigit(item.delta_percentage + 0.12, 2),
      confidence: item.confidence !== null ? item.confidence + 0.02 : null,
    })),
  ];

  return testCompareDataWithSeveralTests;
}

// This function takes an array of result items, and adds to it a copy of these
// items where the "new" revision is changed. It also changes the delta and
// confidence values so that a sorting operation can distinguish them.
export function augmentCompareDataWithSeveralRevisions(
  testCompareData: CompareResultsItem[],
): CompareResultsItem[] {
  const testCompareDataWithSeveralRevisions = [
    ...testCompareData,
    // Add items with the same tests, but a different revision
    ...testCompareData.map((item) => ({
      ...item,
      new_rev: 'tictactoe',
      // Different delta and confidence values, with some arbitrary changes
      delta_value: item.delta_value + 0.8,
      delta_percentage: roundAtDigit(item.delta_percentage + 0.08, 2),
      confidence: item.confidence !== null ? item.confidence + 0.015 : null,
    })),
  ];

  return testCompareDataWithSeveralRevisions;
}
