import { useRef, useEffect } from "preact/hooks";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export function useResponseCache<T>(
  key: string,
  data: T | undefined,
  maxAge = 5 * 60 * 1000
) {
  const cache = useRef<Map<string, CacheEntry<T>>>(new Map());

  useEffect(() => {
    if (data) {
      cache.current.set(key, {
        data,
        timestamp: Date.now(),
      });
    }
  }, [key, data]);

  const getCachedData = (key: string): T | undefined => {
    const entry = cache.current.get(key);
    if (!entry) return undefined;

    const isExpired = Date.now() - entry.timestamp > maxAge;
    if (isExpired) {
      cache.current.delete(key);
      return undefined;
    }

    return entry.data;
  };

  return {
    getCachedData,
  };
}
