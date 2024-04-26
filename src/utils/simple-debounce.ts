/**
 * This implements a simple debounce operation. The default debounce delay is
 * 500ms but it can be changed.
 * The debounced function will be called only after the returned function isn't
 * called for "idleTime" ms.
 * This accepts any function that takes a unique parameter. The return value for
 * the function is lost.
 */
export const simpleDebounce = <T>(
  func: (val: T) => unknown,
  idleTime = 500,
) => {
  let timeout: null | ReturnType<typeof setTimeout> = null;
  const debouncedFunc = (val: T): void => {
    const onTimeout = () => {
      func(val);
    };

    // Clear any existing timer each time the function is called.
    if (timeout) clearTimeout(timeout);
    // And schedule a new one.
    timeout = setTimeout(onTimeout, idleTime);
  };
  return debouncedFunc;
};
