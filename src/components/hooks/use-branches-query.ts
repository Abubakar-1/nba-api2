/**
 * React Query hooks for branches management
 * Provides optimized data fetching with automatic caching
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBranches, changeBranchStatus, deleteBranch } from "@/api/branch";
import { queryKeys } from "@/api/react-query";
import { IBranchResponse, IBranch } from "@/api/interfaces/branch";
import { logger } from "@/utils/logger";

interface BranchFilters {
  page: number;
  page_size?: number;
  search: string;
}

/**
 * Fetch branches with automatic caching and refetching
 */
export function useBranchesQuery(filters: BranchFilters) {
  return useQuery({
    queryKey: queryKeys.branches.list(filters),
    queryFn: async () => {
      try {
        logger.debug("Fetching branches with filters", filters);
        const [response, error] = await getBranches(filters);

        if (error) {
          logger.error("Failed to fetch branches", error);
          throw error;
        }

        // Transform new API response format to expected format
        const apiResponse = response as any;

        // Check if response has new format (data/meta)
        if (apiResponse?.data && apiResponse?.meta) {
          const transformedResponse: IBranchResponse = {
            items: apiResponse.data,
            pagination: {
              page: apiResponse.meta.page,
              page_size: apiResponse.meta.limit,
              total_rows: apiResponse.meta.total,
            },
          };
          return transformedResponse;
        }

        // Return as-is if already in old format
        return response as IBranchResponse;
      } catch (error) {
        logger.error("Branches query error", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

/**
 * Fetch admin branches with automatic caching
 */
export function useAdminBranchesQuery(filters: BranchFilters) {
  return useQuery({
    queryKey: ["adminBranches", filters],
    queryFn: async () => {
      try {
        const { getAdminBranches } = await import("@/api/branch");
        const [response, error] = await getAdminBranches(filters);
        if (error) throw error;

        // Transform new API response format to expected format
        const apiResponse = response as any;

        // Check if response has new format (data/meta)
        if (apiResponse?.data && apiResponse?.meta) {
          const transformedResponse: IBranchResponse = {
            items: apiResponse.data,
            pagination: {
              page: apiResponse.meta.page,
              page_size: apiResponse.meta.limit,
              total_rows: apiResponse.meta.total,
            },
          };
          return transformedResponse;
        }

        // Return as-is if already in old format
        return response as IBranchResponse;
      } catch (error) {
        logger.error("Admin branches query error", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Update branch status (activate/deactivate)
 */
export function useChangeBranchStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { isActive: boolean; id: number }) => {
      logger.debug("Updating branch status", params);
      const [response, error] = await changeBranchStatus(params);

      if (error) {
        logger.error("Failed to update branch status", error);
        throw error;
      }

      return response;
    },
    onSuccess: () => {
      logger.debug("Branch status updated successfully", {});
      // Invalidate all branch queries to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.branches.all,
      });
    },
    onError: (error) => {
      logger.error("Branch status mutation failed", error);
    },
  });
}

/**
 * Delete branch
 */
export function useDeleteBranchMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      logger.debug("Deleting branch", { code });
      const [response, error] = await deleteBranch(code);

      if (error) {
        logger.error("Failed to delete branch", error);
        throw error;
      }

      return response;
    },
    onSuccess: () => {
      logger.debug("Branch deleted successfully", {});
      // Invalidate all branch queries to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.branches.all,
      });
    },
    onError: (error) => {
      logger.error("Delete branch mutation failed", error);
    },
  });
}

/**
 * Prefetch branches for pagination
 */
export function usePrefetchBranches() {
  const queryClient = useQueryClient();

  return async (filters: BranchFilters) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.branches.list(filters),
      queryFn: async () => {
        const [response, error] = await getBranches(filters);
        if (error) throw error;
        return response as IBranchResponse;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}
