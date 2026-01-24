import { useState, useCallback } from "preact/hooks";

interface RequestState {
  isLoading: boolean;
  error: null | Error;
}

export function useRequest<P = any>(func: (...args: any) => any, def?: any) {
  const [state, setState] = useState<RequestState>({
    isLoading: false,
    error: null,
  });
  const [response, setResponse] = useState(def);

  // Memoize makeRequest to prevent function recreation on every render
  const makeRequest = useCallback(
    async (data: P, ...params: any) => {
      setState({ isLoading: true, error: null });

      const [response, error] = await func({ ...params, ...data });
      if (response) {
        setResponse(response);
      }

      setState({ isLoading: false, error });
      return [response, error];
    },
    [func]
  );

  return {
    ...state,
    response,
    makeRequest,
  };
}
