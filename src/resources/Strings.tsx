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
      text: 'This is an unstable pre-release version. Some features may not yet be supported.',
      linkText: 'File a bug on Bugzilla.',
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
        img: 'https://user-images.githubusercontent.com/88336547/233237125-1534220b-c343-421a-9133-ce8f151cb979.png',
        imgDark:
          'https://user-images.githubusercontent.com/88336547/233250674-004d071a-7c23-40f4-b348-0687a3fef6e3.png',
        compareBtn: 'Compare',
        editText: 'Edit entry',
        collapsed: {
          warnings: {
            comparison:
              'Comparing “try” repository to any repository aside from “try” is not recommended.',
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
        img: 'https://user-images.githubusercontent.com/88336547/233250659-4012551b-e07a-44ce-accb-242e29d31914.png',
        imgDark:
          'https://user-images.githubusercontent.com/88336547/233250642-7fd7c217-e72b-4375-9078-7ed2f99cb0f7.png',
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
        downloadProfilers: 'open the performance profile for this job',
        jobLink: 'open treeherder view for',
        retriggerJobs: 'retrigger jobs',
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
    },
  },
  errors: {
    warningText: 'Search must be a 12- or 40-character hash, or email address',
  },
};
