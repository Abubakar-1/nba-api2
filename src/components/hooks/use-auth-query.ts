/**
 * React Query hooks for auth management
 * Handles authentication and token caching
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { loginApi } from "@/api/auth";
import { queryKeys } from "@/api/react-query";
import { ILogin } from "@/api/interfaces/auth";
import { logger } from "@/utils/logger";

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: any;
}

/**
 * Login mutation with automatic token storage
 */
export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: ILogin) => {
      try {
        logger.debug("Attempting login", { username: credentials.username });
        const [response, error] = await loginApi(credentials);

        if (error) {
          logger.error("Login failed", error);
          throw error;
        }

        // Store access token only in localStorage
        if (response?.access_token) {
          localStorage.setItem("access_token", response.access_token);
          logger.debug("Access token stored", {});
        }

        return response as LoginResponse;
      } catch (error) {
        logger.error("Login mutation error", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      logger.debug("Login successful", { userId: data?.user?.id });
      // Invalidate auth queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.auth.me(),
      });
    },
    onError: (error) => {
      logger.error("Login mutation failed", error);
    },
  });
}

/**
 * Logout mutation - clear tokens and cache
 */
export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      logger.debug("Logging out", {});
      // Clear tokens
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      logger.debug("Tokens cleared", {});
      return true;
    },
    onSuccess: () => {
      logger.debug("Logout successful", {});
      // Clear all cached queries
      queryClient.clear();
    },
    onError: (error) => {
      logger.error("Logout mutation failed", error);
    },
  });
}

/**
 * Get current authenticated user
 */
export function useCurrentUserQuery() {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          logger.debug("No auth token found", {});
          throw new Error("Not authenticated");
        }

        // This would typically call an endpoint to get current user
        // For now, just return cached token info
        logger.debug("Fetching current user", {});
        return { token };
      } catch (error) {
        logger.error("Current user query error", error);
        throw error;
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: false,
  });
}
