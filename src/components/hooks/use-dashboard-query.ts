/**
 * React Query hooks for dashboard management
 * Provides optimized data fetching with automatic caching
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAdminDashboard, getUserDashboard } from "@/api/dashboard";
import { queryKeys } from "@/api/react-query";
import {
  IAdminDashboard,
  IDashboardResponse,
  IDashboardProps,
} from "@/api/interfaces/dashboard";
import { logger } from "@/utils/logger";

/**
 * Fetch admin dashboard with automatic caching
 */
export function useAdminDashboardQuery(year: string) {
  return useQuery({
    queryKey: queryKeys.dashboard.admin(year),
    queryFn: async () => {
      try {
        logger.debug("Fetching admin dashboard", { year });
        const [response, error] = await getAdminDashboard({ year });

        if (error) {
          logger.error("Failed to fetch admin dashboard", error);
          throw error;
        }

        return response as IAdminDashboard;
      } catch (error) {
        logger.error("Admin dashboard query error", error);
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (dashboard data changes less frequently)
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    refetchOnWindowFocus: false, // Dashboard doesn't need to refetch on tab switch
    refetchOnReconnect: true,
  });
}

/**
 * Fetch user dashboard with automatic caching
 */
export function useUserDashboardQuery() {
  return useQuery({
    queryKey: queryKeys.dashboard.user(),
    queryFn: async () => {
      try {
        logger.debug("Fetching user dashboard", {});
        const [response, error] = await getUserDashboard({ status: "" });

        if (error) {
          logger.error("Failed to fetch user dashboard", error);
          throw new Error(error.message || "Failed to fetch user dashboard");
        }

        logger.debug("User dashboard response", response);
        return response as IDashboardResponse;
      } catch (error: any) {
        logger.error("User dashboard query error", error);
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
}

/**
 * Invalidate dashboard cache (useful after mutations)
 */
export function useInvalidateDashboard() {
  const queryClient = useQueryClient();

  return async () => {
    logger.debug("Invalidating dashboard cache", {});
    await queryClient.invalidateQueries({
      queryKey: queryKeys.dashboard.user(),
    });
  };
}

/**
 * Invalidate admin dashboard cache
 */
export function useInvalidateAdminDashboard() {
  const queryClient = useQueryClient();

  return async (year?: string) => {
    logger.debug("Invalidating admin dashboard cache", { year });
    if (year) {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.admin(year),
      });
    } else {
      // Invalidate all admin dashboard queries
      await queryClient.invalidateQueries({
        queryKey: ["dashboard", "admin"],
      });
    }
  };
}
