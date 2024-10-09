export const Strings = {
  metaData: {
    pageTitle: {
      search: 'PerfCompare - Search',
      results: 'PerfCompare - Results',
      subtests: 'PerfCompare - Subtests Results',
    },
  },
  components: {
    topBanner: {
      text: 'This is a recently-released version, and we are actively addressing bugs and enhancing performance. If you experience any issues, please',
      linkText: 'report it on Bugzilla',
      href: 'https://bugzilla.mozilla.org/enter_bug.cgi?product=Testing&component=PerfCompare&status_whiteboard=[pcf]',
    },
    contact: {
      text: 'Find us at',
      linkText: '#perfcompare:mozilla.org on Matrix',
      href: 'https://matrix.to/#/#perfcompare:mozilla.org',
    },
    header: {
      title: 'PerfCompare',
      tagline:
        'Analyze results of performance tests to detect regressions and identify opportunities for improvement.',
      bgLink:
        'url(https://user-images.githubusercontent.com/18633586/223226187-83621473-af10-4f7b-a7b9-564378b55c9e.png)',
      darkMode: 'Dark mode',
      lightMode: 'Light mode',
      learnMore: 'Learn more',
    },
    searchDefault: {
      title: 'Compare with a base or over time',
      sharedCollasped: {
        revisions: {
          selectLabel: 'Revisions',
          placeholder: 'Search base by ID number or author email',
        },
        framework: {
          selectLabel: 'Framework',
          tooltip:
            'The framework or test harness containing the test you want to examine.',
        },
        button: 'Compare',
        cancel: 'Cancel',
      },
      base: {
        title: 'Compare with a base',
        tagline: 'Analyze differences between specific revisions.',
        compareBtn: 'Compare',
        editText: 'Edit entry',
        collapsed: {
          warnings: {
            comparison:
              'Production (e.g. mozilla-central, autoland), and try branches have different performance characteristics due to build differences that can often result in misleading comparisons.',
          },
          errors: {
            notEnoughRevisions: 'Please select at least one base revision.',
          },
          base: {
            selectLabel: 'Base',
            inputPlaceholder: 'Search base by ID number or author email',
            tooltip:
              'The baseline revision (no changes) your revision will be compared against.',
          },
          revision: {
            selectLabel: 'Revisions',
            inputPlaceholder: 'Search revision by ID number or author email',
            tooltip:
              'Revisions (typically including your changes) to compare against the selected base revision.',
          },
        },
      },
      overTime: {
        title: 'Compare over time',
        tagline:
          'Analyze differences between revisions within a specific time range.',
        collapsed: {
          errors: {
            notEnoughRevisions: 'Please select at least one revision.',
          },
          baseRepo: {
            selectLabelBase: 'Base repository',
            tooltipBase: 'The repository to compare revisions against.',
          },
          timeRange: {
            selectLabel: 'Time range',
            tooltip: 'The time range to compare revisions.',
          },
          revisions: {
            selectLabel: 'Revisions',
            tooltip:
              'Revisions (typically including your changes) to compare over a specified time range.',
            inputPlaceholder: 'Search revision by ID number or author email',
          },
        },
      },
    },
    revisionRow: {
      title: {
        subtestsLink: 'open the subtests for this result',
        graphLink: 'open the evolution graph for this job in treeherder',
        jobLink: 'open treeherder view for',
        retriggerJobs: 'retrigger jobs',
        compareViewLink: 'open perfherder compare view for',
      },
    },
    expandableRow: {
      title: {
        expand: 'expand this row',
        shrink: 'shrink this row',
      },
      singleRun: 'Only one run (consider more runs for greater confidence).',
      Low: "A value of 'low' suggests less confidence that there is a sustained, significant change between the two revisions.",
      Medium:
        "A value of 'med' indicates uncertainty that there is a significant change. If you haven't already, consider retriggering the job to be more sure.",
      High: "A value of 'high' indicates more confidence that there is a significant change, however you should check the historical record for the test by looking at the graph to be more sure (some noisy tests can provide inconsistent results).",
    },
    noResultsFound: {
      mainMessage: 'No results found',
      note: 'For the selected revision(s), no results when compared to the base revision.',
    },
    comparisonRevisionDropdown: {
      allRevisions: {
        key: 'all-revisions',
        text: 'All revisions',
      },
    },
    searchResultsInput: {
      placeholder: 'Search results',
      label: 'Search by title, platform, revision or options',
    },
    retrigger: {
      signin: {
        title: 'Sign into Taskcluster to re-trigger the comparison',
        body: 'To be able to retrigger a task within Taskcluster, it’s necessary that you log in to it first. Then PerfCompare will retrigger the task on your behalf.',
        submitButton: 'Sign in',
        cancelButton: 'Not now',
      },
      config: {
        title: 'Retrigger jobs',
        body: 'Choose how many clones of the base and new tasks will be started.',
        submitButton: 'Retrigger',
      },
      notification: {
        body: (taskType: 'base' | 'new', id: string) =>
          `The retrigger request for the ${taskType} run has been sent successfully, with ID ${id}.`,
        treeherderButton: 'Open Treeherder',
      },
    },
  },
  errors: {
    warningText: 'Search must be a 12- or 40-character hash, or email address',
  },
};
