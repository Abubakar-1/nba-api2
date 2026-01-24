/**
 * React Query hooks for conference management
 * Provides optimized data fetching with automatic caching
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getAdminConference, 
  getAdminConferenceMetrics, 
  getCategory, 
  getCategoryDetails,
  getConferencePayments,
  verifyConferencePayment,
  getUserConference
} from "@/api/conference";
import { queryKeys } from "@/api/react-query";
import { logger } from "@/utils/logger";

/**
 * Fetch admin conferences with automatic caching
 */
export function useAdminConferenceQuery(filters: any) {
  return useQuery({
    queryKey: ["adminConferences", filters.page, filters.page_size, filters.search],
    queryFn: async () => {
      try {
        logger.debug("Fetching admin conferences", filters);
        const [response, error] = await getAdminConference(filters);
        if (error) throw error;
        return response;
      } catch (error) {
        logger.error("Admin conference query error", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch user conferences with automatic caching
 */
export function useUserConferenceQuery(filters: any) {
  return useQuery({
    queryKey: ["userConferences", filters.page, filters.page_size, filters.search],
    queryFn: async () => {
      try {
        const [response, error] = await getUserConference(filters);
        if (error) throw error;
        return response;
      } catch (error) {
        logger.error("User conference query error", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch admin conference metrics
 */
export function useAdminConferenceMetricsQuery() {
  return useQuery({
    queryKey: ["adminConferenceMetrics"],
    queryFn: async () => {
      try {
        const [response, error] = await getAdminConferenceMetrics();
        if (error) throw error;
        return response;
      } catch (error) {
        logger.error("Admin conference metrics query error", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch conference categories
 */
export function useConferenceCategoriesQuery() {
  return useQuery({
    queryKey: ["conferenceCategories"],
    queryFn: async () => {
      const [response, error] = await getCategory();
      if (error) throw error;
      return response;
    },
    staleTime: 30 * 60 * 1000,
  });
}

/**
 * Fetch conference payments list (admin)
 */
export function useConferencePaymentsQuery(params: any) {
  return useQuery({
    queryKey: ["conferencePayments", params],
    queryFn: async () => {
      const [response, error] = await getConferencePayments(params);
      if (error) throw error;
      return response;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Verify conference payment
 */
export function useVerifyConferencePaymentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ref: string) => {
      const [response, error] = await verifyConferencePayment({ ref });
      if (error) throw error;
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminConferences"] });
      queryClient.invalidateQueries({ queryKey: ["conferencePayments"] });
      queryClient.invalidateQueries({ queryKey: ["adminConferenceMetrics"] });
    },
  });
}
