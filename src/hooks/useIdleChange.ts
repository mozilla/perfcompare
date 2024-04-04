import type { ChangeEvent } from 'react';

const useIdleChange = (onIdleCallback: (val: string) => unknown) => {
  let timeout: null | ReturnType<typeof setTimeout> = null;

  const onIdleChange = (e: ChangeEvent<HTMLInputElement>, idleTime = 500) => {
    const val = e.currentTarget.value;
    const onTimeout = () => {
      onIdleCallback(val);
    };

    // Clear any existing timer whenever user types
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(onTimeout, idleTime);
  };
  return { onIdleChange };
};

export default useIdleChange;
