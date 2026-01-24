/**
 * useDebounceSearch Hook
 * Prevents excessive API calls from rapid search input changes
 * Delays search execution until user stops typing
 */

import { useState, useEffect } from "preact/hooks";

interface UseDebounceSearchOptions {
  delay?: number;
  minLength?: number;
}

export function useDebounceSearch(
  value: string,
  callback: (value: string) => void,
  options: UseDebounceSearchOptions = {}
) {
  const { delay = 500, minLength = 1 } = options;
  const [isDebouncing, setIsDebouncing] = useState(false);

  useEffect(() => {
    setIsDebouncing(true);

    const timer = setTimeout(() => {
      if (value.length >= minLength) {
        callback(value);
      } else if (value.length === 0) {
        callback(""); // Allow clearing search
      }
      setIsDebouncing(false);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay, minLength, callback]);

  return { isDebouncing };
}

/**
 * useDebounce Hook (Generic)
 * Debounces any value for 300ms by default
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
