import { AxiosError, AxiosResponse } from "axios";

export const BASE_URL = import.meta.env.VITE_API_URL ?? "";
const __DEV__ = import.meta.env.DEV;

export async function handleRequest(
  axiosRequest: () => Promise<AxiosResponse<any, any>>
) {
  try {
    const result = await axiosRequest();

    const _error = result.status >= 400;
    if (_error) {
      return [null, result.data];
    }

    return [result.data, null];
  } catch (error) {
    if (__DEV__) {
      console.error(`request failed`, error);
    }

    return [null, handleError(error)];
  }
}

const MSG_RETRY_NETWORK = "Please check your network and try again.";
const MSG_SERVER_ERR = "Something went wrong.";
const DEV_ERRORS = ["SyntaxError", "TypeError"];

function handleError(err: any) {
  const { message, name, response } = err;
  if (!message) {
    return {
      message: MSG_RETRY_NETWORK,
    };
  }

  if (err instanceof TypeError && message === "Failed to fetch") {
    return {
      message: MSG_RETRY_NETWORK,
    };
  }

  if (err instanceof AxiosError && message === "Network Error") {
    return {
      message: MSG_RETRY_NETWORK,
    };
  }

  const hideMessage = DEV_ERRORS.includes(name);
  if (hideMessage) {
    return {
      message: MSG_SERVER_ERR,
    };
  }

  return { message, data: response?.data || {} };
}
