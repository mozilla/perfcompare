import { renderHook } from '@testing-library/react';

import { useQuery } from '../../hooks/useQueryParams';
import { createRouterWrapper } from '../utils/test-utils';

describe('Tests useQueryParams hook', () => {
  const { RouterWrapper } = createRouterWrapper(
    '/?testParam1=test1&testParam2=test2',
  );
  it('should has search params contained in the route', () => {
    const {
      result: { current: urlParams },
    } = renderHook(() => useQuery(), {
      wrapper: RouterWrapper,
    });
    expect(urlParams.get('testParam1')).toBe('test1');
    expect(urlParams.get('testParam2')).toBe('test2');
  });
});
