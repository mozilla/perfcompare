import App, { router } from '../../components/App';
import { FetchMockSandbox, render } from '../utils/test-utils';

describe('Hash to commit good run validating', () => {
  it('should reject hashes not associated with any commits', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    (global.fetch as FetchMockSandbox).get(
      'glob:https://treeherder.mozilla.org/api/project/*/hash/*',
      (url) =>
        url.includes('tocommit')
          ? {
              throws: new Error(
                'Error when requesting treeherder: ["83782697878014813466 or 7844063918536384434 do not correspond to any existing hashes please double check both hashes you provided"]',
              ),
            }
          : {},
    );

    await router.navigate(
      '/compare-results?baseHash=7844063918536384434&baseRepo=try&newHash=83782697878014813466&newRepo=try&framework=1',
    );
    render(<App />);
    // Expecting to have a hashes do not correlate with revision error
    expect(console.error).toHaveBeenCalledWith(
      new Error(
        'Error when requesting treeherder: ["83782697878014813466 or 7844063918536384434 do not correspond to any existing hashes please double check both hashes you provided"]',
      ),
    );
    expect(console.error).toHaveBeenCalledTimes(1);
    (console.error as jest.Mock).mockClear();
  });

  it('should reject invalid results returned from treeherder', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    (global.fetch as FetchMockSandbox).get(
      'glob:https://treeherder.mozilla.org/api/project/*/hash/*',
      (url) => {
        return url.includes('tocommit')
          ? {
              badbaseRevision: 'Press',
              newRevision: 'Another',
            }
          : {};
      },
    );

    await router.navigate(
      '/compare-results?baseHash=7844063918536384434&baseRepo=try&newHash=83782697878014813466&newRepo=try&framework=1',
    );
    render(<App />);
    // Expecting to have an error about unable to parse baseRev and/or newRev returned from treeherder
    expect(console.error).toHaveBeenCalledWith(
      new Error(
        'Unable to parse baseRev and/or newRev returned from treeherder',
      ),
    );
    expect(console.error).toHaveBeenCalledTimes(1);
    (console.error as jest.Mock).mockClear();
  });
});
