export const Strings = {
  metaData: {
    pageTitle: {
      search: 'PerfCompare - Search',
      results: 'PerfCompare - Results',
    },
  },
  components: {
    topBanner: {
      text: 'This is an unstable pre-release version. Some features may not yet be supported. Please file any bugs on the Github Repo.',
      linkText: 'Github Repo',
      href: 'https://github.com/mozilla/perfcompare/issues',
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
        framkework: {
          selectLabel: 'Framework',
          tooltip:
            'The framework or test harness containing the test you want to examine.',
        },
        button: 'Compare',
      },
      base: {
        title: 'Compare with a base',
        tagline: 'Analyze differences between specific revisions.',
        img: 'https://user-images.githubusercontent.com/88336547/233237125-1534220b-c343-421a-9133-ce8f151cb979.png',
        imgDark:
          'https://user-images.githubusercontent.com/88336547/233250674-004d071a-7c23-40f4-b348-0687a3fef6e3.png',
        icons: {
          editImgUrl: '/img/edit.svg',
        },
        collapsed: {
          warnings: {
            comparison:
              'Comparing “try” repository to any repository aside from "try" is not recommended.',
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
        collapedSelectLabel: 'Time range',
      },
    },
    expandableRow: {
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
  },
  errors: {
    warningText: 'Search must be a 12- or 40-character hash, or email address',
  },
};
