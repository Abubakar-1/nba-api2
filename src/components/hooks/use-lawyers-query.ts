/**
 * React Query hook for lawyers management
 * Provides optimized data fetching with automatic caching
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLawyers, changeLawyerStatus } from "@/api/lawyers";
import { queryKeys } from "@/api/react-query";
import { ILawyerResponse } from "@/api/interfaces/lawyers";
import { logger } from "@/utils/logger";

interface LawyersFilterParams {
  page: number;
  page_size: number;
  search: string;
  state_code: string;
  branch: string;
}

/**
 * Fetch lawyers with automatic caching and refetching
 */
export function useLawyersQuery(filters: LawyersFilterParams) {
  return useQuery({
    queryKey: queryKeys.lawyers.list(filters),
    queryFn: async () => {
      try {
        logger.debug("Fetching lawyers with filters", filters);
        const [response, error] = await getLawyers(filters);

        if (error) {
          logger.error("Failed to fetch lawyers", error);
          throw error;
        }

        // Transform new API response format to expected format
        const apiResponse = response as any;

        // Check if response has new format (data/meta)
        if (apiResponse?.data && apiResponse?.meta) {
          const transformedResponse: ILawyerResponse = {
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
        return response as ILawyerResponse;
      } catch (error) {
        logger.error("Lawyers query error", error);
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
 * Update lawyer status (activate/suspend)
 */
export function useChangeLawyerStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { isActive: boolean; id: number }) => {
      logger.debug("Updating lawyer status", params);
      const [response, error] = await changeLawyerStatus(params);

      if (error) {
        logger.error("Failed to update lawyer status", error);
        throw error;
      }

      return response;
    },
    onSuccess: () => {
      logger.debug("Lawyer status updated successfully", {});
      // Invalidate all lawyer queries to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.lawyers.all,
      });
    },
    onError: (error) => {
      logger.error("Lawyer status mutation failed", error);
    },
  });
}

/**
 * Prefetch lawyers for pagination
 */
export function usePrefetchLawyers() {
  const queryClient = useQueryClient();

  return async (filters: LawyersFilterParams) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.lawyers.list(filters),
      queryFn: async () => {
        const [response, error] = await getLawyers(filters);
        if (error) throw error;

        // Transform new API response format to expected format
        const apiResponse = response as any;

        // Check if response has new format (data/meta)
        if (apiResponse?.data && apiResponse?.meta) {
          const transformedResponse: ILawyerResponse = {
            items: apiResponse.data,
            pagination: {
              page: apiResponse.meta.page,
              page_size: apiResponse.meta.limit,
              total_rows: apiResponse.meta.total,
            },
          };
          return transformedResponse;
        }

        return response as ILawyerResponse;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}
