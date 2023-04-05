export const Strings = {
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
    compareDefault: {
      title: 'Compare with a base or over time',
      sharedCollasped: {
        revisions: {
          selectLabel: 'Revisions',
          selectIcon: '',
          inputLabel: 'Search revision by ID number or author email',
        },
        framkework: {
          selectLabel: 'Framework',
          selectIcon: '',
        },
        button: 'Compare',
      },
      base: {
        title: 'Compare with a base',
        tagline: 'Analyze differences between specific revisions.',
        img: '',
        collapedBase: {
          selectLabel: 'Base',
          selectIcon: '',
          inputLabel: 'Search base by ID number or author email',
        },
      },
      overTime: {
        title: 'Compare over time',
        tagline:
          'Analyze differences between revisions within a specific time range.',
        img: '',
        collapedSelectLabel: 'Time range',
      },
    },
  },
}; 