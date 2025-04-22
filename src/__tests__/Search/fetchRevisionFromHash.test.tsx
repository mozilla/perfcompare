import App, {router} from "../../components/App";
import {
    FetchMockSandbox, render,
} from '../utils/test-utils';

// Test 2 One of baseHash/newHash missing
// Test 3 not numeric hash provided
// Test 4 not existing hash
// test 5 good run

describe('Hash to commit good run validating', () => {
    it('should reject bad null results', async () => {

      jest.spyOn(console, 'error').mockImplementation(() => {});


      (global.fetch as FetchMockSandbox).get(
      'glob:https://treeherder.mozilla.org/api/project/*/hash/*',
      (url) =>
        url.includes('tocommit')
          ? {
              throws: new Error('Error when requesting treeherder: ["83782697878014813466 or 7844063918536384434 do not correspond to any existing hashes please double check both hashes you provided"]'),
            }
          : {},
      );

      // Error 1: no baseRev
      await router.navigate('/compare-results?baseHash=7844063918536384434&baseRepo=try&newHash=83782697878014813466&newRepo=try&framework=1');
      render(<App />);
      expect(console.error).toHaveBeenCalledWith(
        new Error('Error when requesting treeherder: ["83782697878014813466 or 7844063918536384434 do not correspond to any existing hashes please double check both hashes you provided"]'),
      );
      expect(console.error).toHaveBeenCalledTimes(1);
      (console.error as jest.Mock).mockClear();
    })
})

