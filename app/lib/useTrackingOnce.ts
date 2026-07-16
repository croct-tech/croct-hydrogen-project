import {useEffect, useRef} from 'react';

/**
 * Runs a tracking callback once per key, surviving re-renders.
 *
 * Useful for view-based events like `interestShown` that should fire a single
 * time per page view instead of on every render.
 */
export function useTrackingOnce(callback: () => void, flag = true, key = '') {
  const tracked = useRef<string | null>(null);

  useEffect(() => {
    if (tracked.current !== key && flag) {
      tracked.current = key;
      callback();
    }
  }, [callback, flag, key]);
}
