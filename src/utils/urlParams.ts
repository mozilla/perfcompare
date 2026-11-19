// Copies the value of `param` from `source` onto `target`, leaving it out when
// it's absent from `source`.
export function copyParamIfPresent(
  source: URLSearchParams,
  target: URLSearchParams,
  param: string,
): URLSearchParams {
  const value = source.get(param);
  if (value !== null) {
    target.set(param, value);
  }
  return target;
}
