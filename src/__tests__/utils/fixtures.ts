import type { Revision } from '../../types/state';

const getTestData = () => {
  const testData: Revision[] = [
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
          comments: "you've got no arms left!",
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
          comments: "it's just a flesh wound",
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
          comments: 'What, ridden on a horse?',
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
          comments: 'She turned me into a newt!',
        },
        {
          result_set_id: 4,
          repository_id: 77,
          revision: 'spam',
          author: 'grahamchapman@python.com',
          comments: 'It got better...',
        },
      ],
      revision_count: 1,
      push_timestamp: 1649808000,
      repository_id: 77,
    },
  ];
  return { testData };
};
export default getTestData;
