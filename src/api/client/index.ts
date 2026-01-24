import Axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { logger } from "@/utils/logger";

// Default endpoints
const AUTH_API_URL =
  import.meta.env.VITE_AUTH_API_URL ?? "https://nbabackend.online:4443";
const MAIN_API_URL =
  import.meta.env.VITE_API_URL ?? "https://nbabackend.online:4443";

/**
 * Clear all authentication data and redirect to login
 */
function handleLogout() {
  logger.debug("Logging out user due to authentication failure");

  // Clear all auth-related data
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  localStorage.removeItem("conference");

  // Redirect to login page
  window.location.href = "/login";
}

const responseSuccessHandler = (res: AxiosResponse) => {
  return res;
};

const responseErrorHandler = async function (error: any) {
  const requestConfig: any = error.config;

  // Check for 401 Unauthorized errors
  const isAuthError = error?.response?.status === 401;
  const isTokenError =
    error?.response?.data?.info === "Token expired" ||
    error?.response?.data?.message === "Unauthorized" ||
    error?.response?.data?.message === "Invalid token";

  // If 401 error and NOT from login endpoint, logout immediately
  if ((isAuthError || isTokenError) && requestConfig.url !== "/auth/login") {
    logger.warn("Unauthorized error detected, logging out user", {
      url: requestConfig.url,
      status: error?.response?.status,
    });

    // Logout and redirect
    handleLogout();
  }

  return Promise.reject(error);
};

const client = (config: AxiosRequestConfig) => Axios.create(config);

/**
 * Unified HTTP client factory
 * Handles both auth and main APIs with automatic token management
 *
 * @param config - Axios config (baseURL will be set automatically if not provided)
 * @param skipInterceptors - Whether to skip interceptors (for refresh token requests)
 * @returns Axios instance
 */
export function createClient(
  config: AxiosRequestConfig<any> = {},
  skipInterceptors?: boolean,
) {
  const baseURL =
    config.baseURL ||
    (config.baseURL?.includes("auth") ? AUTH_API_URL : MAIN_API_URL);

  const req: AxiosRequestConfig = {
    baseURL,
    ...config,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (config?.headers) {
    req.headers = Object.assign({ ...req.headers }, config.headers);
  }

  // Use consistent token retrieval
  const token = localStorage.getItem("access_token");

  if (token) {
    req.headers = Object.assign(
      { ...req.headers },
      {
        Authorization: `Bearer ${token}`,
      },
    );
  }

  const clientInstance = client(req);

  // Only add interceptors if not explicitly skipped
  if (!skipInterceptors) {
    // Add response interceptor to handle 401 errors
    clientInstance.interceptors.response.use(
      responseSuccessHandler,
      responseErrorHandler,
    );
  }

  return clientInstance;
}

/**
 * Default client - for primary API
 * @deprecated Use createClient() instead
 * Kept for backward compatibility
 */
export default function clientRequest(
  config: AxiosRequestConfig<any> = {},
  skipInterceptors?: boolean,
) {
  return createClient({ baseURL: AUTH_API_URL, ...config }, skipInterceptors);
}

/**
 * Legacy second client - now unified
 * @deprecated Use createClient() with proper baseURL instead
 * Kept for backward compatibility - automatically routes to MAIN_API_URL
 */
export function clientRequest2(
  config: AxiosRequestConfig<any> = {},
  skipInterceptors?: boolean,
) {
  return createClient({ baseURL: MAIN_API_URL, ...config }, skipInterceptors);
}
