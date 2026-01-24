/**
 * React Query hook for verified lawyers list
 * Mirrors the optimization applied to lawyers list
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getVerifiedList } from "@/api/verified-lawyers-list";
import { queryKeys } from "@/api/react-query";
import { logger } from "@/utils/logger";
import { getAdminVerifiedNIN } from "@/api/lawyers";

interface VerifiedFilters {
  page: number;
  page_size?: number;
  search?: string;
}

export function useVerifiedLawyersQuery(filters: VerifiedFilters) {
  return useQuery({
    queryKey: queryKeys.lawyers.list(filters),
    queryFn: async () => {
      try {
        logger.debug("Fetching verified lawyers", filters);
        const [response, error] = await getAdminVerifiedNIN(filters);
        if (error) {
          logger.error("Failed to fetch verified lawyers", error);
          throw error;
        }

        // Transform new API response format to expected format
        const apiResponse = response as any;

        // Check if response has new format (data/meta)
        if (apiResponse?.data && apiResponse?.meta) {
          const transformedResponse = {
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
        return response;
      } catch (err) {
        logger.error("Verified lawyers query error", err);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
}

export function usePrefetchVerifiedLawyers() {
  const queryClient = useQueryClient();

  return async (filters: VerifiedFilters) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.lawyers.list(filters),
      queryFn: async () => {
        const [response, error] = await getAdminVerifiedNIN(filters);
        if (error) throw error;

        // Transform new API response format to expected format
        const apiResponse = response as any;

        // Check if response has new format (data/meta)
        if (apiResponse?.data && apiResponse?.meta) {
          const transformedResponse = {
            items: apiResponse.data,
            pagination: {
              page: apiResponse.meta.page,
              page_size: apiResponse.meta.limit,
              total_rows: apiResponse.meta.total,
            },
          };
          return transformedResponse;
        }

        return response;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}
