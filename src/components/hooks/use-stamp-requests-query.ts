/**
 * React Query hook for Stamp & Seal requests
 * Provides optimized data fetching with automatic caching and prefetching
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllStampSealRequest } from "@/api/stamp-seal-request";
import { queryKeys } from "@/api/react-query";
import { logger } from "@/utils/logger";

interface StampRequestFilters {
  page: number;
  page_size: number;
  search?: string;
  remark_status?: string;
}

export function useStampRequestsQuery(filters: StampRequestFilters) {
  return useQuery({
    queryKey: queryKeys.stampSeal.list(filters),
    queryFn: async () => {
      try {
        logger.debug("Fetching stamp requests", filters);
        const [response, error] = await getAllStampSealRequest(filters);
        if (error) {
          logger.error("Failed to fetch stamp requests", error);
          throw error;
        }
        return response;
      } catch (err) {
        logger.error("Stamp requests query error", err);
        throw err;
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
 * Fetch admin stamp seal orders with automatic caching
 */
export function useAdminStampSealOrdersQuery(filters: any) {
  return useQuery({
    queryKey: ["adminStampSealOrders", filters],
    queryFn: async () => {
      try {
        const { getAdminStampSealOrders } =
          await import("@/api/stamp-seal-request");
        const [response, error] = await getAdminStampSealOrders(filters);
        if (error) throw error;

        // Transform the response to match expected format
        const apiResponse = response as any;

        // Check if response has 'orders' field and transform it to 'items'
        if (apiResponse?.orders) {
          return {
            ...apiResponse,
            items: apiResponse.orders,
            pagination: {
              page: apiResponse.pagination?.page || filters.page || 1,
              page_size:
                apiResponse.pagination?.limit || filters.page_size || 20,
              total_rows: apiResponse.pagination?.total || 0,
              totalPages: apiResponse.pagination?.totalPages || 0,
              // Keep original fields for compatibility
              limit: apiResponse.pagination?.limit,
              total: apiResponse.pagination?.total,
            },
          };
        }

        return response;
      } catch (error) {
        logger.error("Admin stamp seal orders query error", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePrefetchStampRequests() {
  const queryClient = useQueryClient();

  return async (filters: StampRequestFilters) => {
    await queryClient.prefetchQuery({
      queryKey: ["adminStampSealOrders", filters],
      queryFn: async () => {
        const { getAdminStampSealOrders } =
          await import("@/api/stamp-seal-request");
        const [response, error] = await getAdminStampSealOrders(filters);
        if (error) throw error;

        // Apply same transformation as useAdminStampSealOrdersQuery
        const apiResponse = response as any;
        if (apiResponse?.orders) {
          return {
            ...apiResponse,
            items: apiResponse.orders,
            pagination: {
              page: apiResponse.pagination?.page || filters.page || 1,
              page_size:
                apiResponse.pagination?.limit || filters.page_size || 20,
              total_rows: apiResponse.pagination?.total || 0,
              totalPages: apiResponse.pagination?.totalPages || 0,
              limit: apiResponse.pagination?.limit,
              total: apiResponse.pagination?.total,
            },
          };
        }
        return response;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}
