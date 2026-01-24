import {
  useEffect,
  useState,
  useLayoutEffect,
  useCallback,
  useMemo,
} from "preact/hooks";
import { paramsToArray } from "@/assets/js/utils";

interface RequestState {
  isLoading: boolean;
  error: null | Error;
}

export function useFetcher<P = any, Q = any>(
  func: (...args: any) => any,
  params?: P,
  requiredKeys: string[] = []
) {
  const [state, setState] = useState<RequestState>({
    isLoading: false,
    error: null,
  });
  const [response, setResponse] = useState<Q>();

  // Memoize deps array to prevent unnecessary re-renders
  const deps = useMemo(
    () => (params ? [...paramsToArray(params)] : []),
    [params]
  );
  
  // Memoize params stable version to prevent recreation on every render
  const memoizedParams = useMemo(() => params, [...deps]);

  // Memoize makeRequest to prevent recreation on every render
  const makeRequest = useCallback(async () => {
    setState({ isLoading: true, error: null });

    const [response, error] = await func({ ...memoizedParams });
    if (response) {
      setResponse(response);
    }

    setState({ isLoading: false, error });
    return [response, error];
  }, [func, memoizedParams]);

  useLayoutEffect(() => {
    const newParams: any = { ...params };

    for (let key of requiredKeys) {
      if (!newParams[key] || !newParams) {
        return;
      }
    }

    makeRequest();
  }, [...deps, makeRequest]);

  return {
    ...state,
    response,
    makeRequest,
  };
}
