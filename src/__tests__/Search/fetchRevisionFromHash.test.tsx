import App, { router } from '../../components/App';
import { FetchMockSandbox, render } from '../utils/test-utils';

describe('Hash to commit good run validating', () => {
  it('Should return a baseRev not found if we return a null baseRev', async () => {
    // Silence console.error for a better console output. We'll check its result later.
    // If an expectation toHaveBeenCalledTimes fails, it might be easier to
    // remove the mockImplementation part to debug.

    jest.spyOn(console, 'error').mockImplementation(() => {});
    (global.fetch as FetchMockSandbox).get(
      'glob:https://treeherder.mozilla.org/api/project/*/hash/*',
      (url) => {
        return url.includes('tocommit')
          ? {
              baseRevision: null,
              newRevision: 'Another',
            }
          : {};
      },
    );

    // Error 1: no baseRev
    await router.navigate(
      '/compare-hash-results?baseHash=7844063918536384434&baseRepo=try&newHash=83782697878z014813466&newHashDate=03-20-2025&baseHashDate=03-20-2025&newRepo=try&framework=1',
    );
    render(<App />);
    expect(console.error).toHaveBeenCalledWith(
      new Error('The parameter baseRev is missing.'),
    );
    expect(console.error).toHaveBeenCalledTimes(1);
    (console.error as jest.Mock).mockClear();
  });

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
      '/compare-hash-results?baseHash=7844063918536384434&baseRepo=try&newHash=83782697878z014813466&newHashDate=03-20-2025&baseHashDate=03-20-2025&newRepo=try&framework=1',
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

  it('should display a different error message if the datehash is today and not found', async () => {
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
      '/compare-hash-results?baseHash=7844063918536384434&baseRepo=try&newHash=83782697878z014813466&newHashDate=' +
        new Date().toISOString().split('T')[0] +
        '&baseHashDate=03-20-2025&newRepo=try&framework=1',
    );
    render(<App />);
    // Expecting to have a hashes do not correlate with revision error
    expect(console.error).toHaveBeenCalledWith(
      new Error('Results pushed today, still processing...'),
    );
    expect(console.error).toHaveBeenCalledTimes(1);
    (console.error as jest.Mock).mockClear();
  });

  it('should reject invalid results returned from treeherder', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await router.navigate(
      '/compare-hash-results?baseHash=7844063918536384434&baseRepo=try&newHash=83782697878014813466&newRepo=try&framework=1',
    );
    render(<App />);
    // Expecting to have an error about unable to parse baseRev and/or newRev returned from treeherder
    expect(console.error).toHaveBeenCalledWith(
      new Error(
        'Not all values were supplied please check you provided all 4 of: baseHash, baseHashDate, newHash, newHashDate',
      ),
    );
    expect(console.error).toHaveBeenCalledTimes(1);
    (console.error as jest.Mock).mockClear();
  });
});
