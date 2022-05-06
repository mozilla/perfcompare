const getTestData = () => {
  const testData = [
    {
      id: 1,
      revision: 'coconut',
      author: 'johncleese@python.com',
      push_timestamp: 42,
      repository_id: 4,
      revisions: [
        {
          revision: 'coconut',
          author: 'johncleese@python.com',
          comments: "you've got no arms left!",
        },
      ],
    },
    {
      id: 2,
      revision: 'spam',
      author: 'ericidle@python.com',
      push_timestamp: 42,
      repository_id: 3,
      revisions: [
        {
          revision: 'spam',
          author: 'ericidle@python.com',
          comments: "it's just a flesh wound",
        },
      ],
    },
  ];
  return { testData };
};

export default getTestData;
