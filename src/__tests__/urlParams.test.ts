import { copyParamIfPresent } from '../utils/urlParams';

describe('copyParamIfPresent', () => {
  it('copies the parameter when it is present in the source', () => {
    const source = new URLSearchParams('numberOfDataPoints=25');
    const target = new URLSearchParams('baseRepo=try');

    copyParamIfPresent(source, target, 'numberOfDataPoints');

    expect(target.get('numberOfDataPoints')).toBe('25');
    expect(target.get('baseRepo')).toBe('try');
  });

  it('leaves the parameter out when it is absent from the source', () => {
    const source = new URLSearchParams('baseRepo=try');
    const target = new URLSearchParams('framework=1');

    copyParamIfPresent(source, target, 'numberOfDataPoints');

    expect(target.has('numberOfDataPoints')).toBe(false);
    expect(target.toString()).toBe('framework=1');
  });

  it('copies an empty value as an empty value', () => {
    const source = new URLSearchParams('numberOfDataPoints=');
    const target = new URLSearchParams();

    copyParamIfPresent(source, target, 'numberOfDataPoints');

    expect(target.get('numberOfDataPoints')).toBe('');
  });

  it('returns the target so calls can be chained', () => {
    const source = new URLSearchParams('numberOfDataPoints=10');
    const target = new URLSearchParams();

    expect(copyParamIfPresent(source, target, 'numberOfDataPoints')).toBe(
      target,
    );
  });
});
