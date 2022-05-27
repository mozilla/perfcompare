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
    {
      id: 3,
      revision: 'spamspam',
      author: 'terrygilliam@python.com',
      push_timestamp: 42,
      repository_id: 4,
      revisions: [
        {
          revision: 'coconut',
          author: 'terrygilliam@python.com',
          comments: 'What, ridden on a horse?',
        },
      ],
    },
    {
      id: 4,
      revision: 'spamspamspamandeggs',
      author: 'michaelpalin@python.com',
      push_timestamp: 42,
      repository_id: 3,
      revisions: [
        {
          revision: 'spam',
          author: 'michaelpalin@python.com',
          comments:
            "You've got two empty 'alves of coconuts and you're bangin' 'em togetha!",
        },
      ],
    },
    {
      id: 5,
      revision: 'spamspamspamspamandeggs',
      author: 'grahamchapman@python.com',
      push_timestamp: 42,
      repository_id: 3,
      revisions: [
        {
          revision: 'spam',
          author: 'grahamchapman@python.com',
          comments: 'She turned me into a newt!',
        },
      ],
    },
  ];
  return { testData };
};
export default getTestData;
