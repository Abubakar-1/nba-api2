import { useCallback, useRef, useEffect } from "preact/hooks";
import debounce from "lodash/debounce";

export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
) {
  const debouncedFn = useRef<ReturnType<typeof debounce>>();

  useEffect(() => {
    debouncedFn.current = debounce(callback, delay);
    return () => {
      debouncedFn.current?.cancel();
    };
  }, [callback, delay]);

  return useCallback(
    (...args: Parameters<T>) => {
      debouncedFn.current?.(...args);
    },
    [debouncedFn]
  );
}
