import {
  getStampSealOrders,
  getStampSealOrder,
  uploadStampSealAttachment,
  getAdminStampSealOrders,
  getAdminStampSealOrderLogs,
  getAdminStampSealTypeDetails,
  verifyAdminStampSealOrder,
  updateAdminStampSealOrderStatus,
  markAdminStampSealOrder,
} from "./stamp-seal-request";
import { getAdminDashboard } from "./dashboard";
import {
  getAdminLawyers,
  getAdminLawyerStats,
  getAdminLawyerDetails,
  getAdminVerifiedNIN,
  getAdminVerifiedNINDetails,
} from "./lawyers";
import {
  getAdminBranches,
  getAdminBranchDetails,
  getBranchDuesPayments,
} from "./branch";
import {
  getAdminTransaction,
  getAdminTransactionStats,
  getAdminTransactionDetails,
} from "./transaction";
import {
  getAdminConference,
  getAdminConferenceDetails,
  getCategoryDetails,
  getConferencePayments,
} from "./conference";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "./notifications";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientConfig,
} from "@tanstack/react-query";
import { logger } from "@/utils/logger";

// Custom hook to fetch stamp-seal orders
export function useStampSealOrders(
  params: {
    verified?: boolean;
    printed?: boolean;
    delivered?: boolean;
    page?: number;
    limit?: number;
  },
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["stampSealOrders", params],
    queryFn: async () => {
      try {
        const [response, error] = await getStampSealOrders(params);
        if (error) {
          logger.error("Failed to fetch stamp seal orders", error);
          throw error;
        }
        return response;
      } catch (error) {
        logger.error(
          "Stamp seal orders endpoint error (may not be implemented)",
          error,
        );
        // Return empty result instead of throwing to prevent UI errors
        return {
          items: [],
          pagination: { page: 1, total_rows: 0, page_size: 50 },
        };
      }
    },
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled !== false, // Only fetch if explicitly enabled
    retry: 1, // Reduce retries for failing endpoint
    retryDelay: 2000,
  });
}

export function useStampSealOrder(
  id: string | number,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["stampSealOrder", id],
    queryFn: async () => {
      const [response, error] = await getStampSealOrder(id);
      if (error) throw error;
      return response;
    },
    enabled: options?.enabled,
  });
}

export function useUploadStampSealAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string | number;
      data: FormData;
    }) => {
      const [response, error] = await uploadStampSealAttachment(id, data);
      if (error) throw error;
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stampSealOrders"] });
      queryClient.invalidateQueries({ queryKey: ["stampSealOrder"] });
    },
  });
}

// Admin Hooks
export function useAdminDashboard(
  year: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["adminDashboard", year],
    queryFn: async () => {
      const [response, error] = await getAdminDashboard({ year });
      if (error) throw error;
      return response;
    },
    enabled: options?.enabled,
  });
}

export function useAdminLawyers(params: any, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["adminLawyers", params],
    queryFn: async () => {
      const [response, error] = await getAdminLawyers(params);
      if (error) throw error;
      return response;
    },
    enabled: options?.enabled,
  });
}

export function useAdminBranches(params: any, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["adminBranches", params],
    queryFn: async () => {
      const [response, error] = await getAdminBranches(params);
      if (error) throw error;
      return response;
    },
    enabled: options?.enabled,
  });
}

export function useAdminTransactions(
  params: any,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["adminTransactions", params],
    queryFn: async () => {
      const [response, error] = await getAdminTransaction(params);
      if (error) throw error;
      return response;
    },
    enabled: options?.enabled,
  });
}

export function useAdminConferences(
  params: any,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["adminConferences", params],
    queryFn: async () => {
      const [response, error] = await getAdminConference(params);
      if (error) throw error;
      return response;
    },
    enabled: options?.enabled,
  });
}

export function useAdminStampSealOrders(
  params: any,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["adminStampSealOrders", params],
    queryFn: async () => {
      const [response, error] = await getAdminStampSealOrders(params);
      if (error) throw error;
      return response;
    },
    enabled: options?.enabled,
  });
}

export function useAdminStampSealOrderLogs(
  id: string | number,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["adminStampSealOrderLogs", id],
    queryFn: async () => {
      const [response, error] = await getAdminStampSealOrderLogs({ id });
      if (error) throw error;
      return response;
    },
    enabled: options?.enabled,
  });
}

export function useAdminTransactionStats(
  params: any,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["adminTransactionStats", params],
    queryFn: async () => {
      const [response, error] = await getAdminTransactionStats(params);
      if (error) throw error;
      return response;
    },
    enabled: options?.enabled,
  });
}

export function useAdminLawyerStats(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["adminLawyerStats"],
    queryFn: async () => {
      const [response, error] = await getAdminLawyerStats();
      if (error) throw error;
      return response;
    },
    enabled: options?.enabled,
  });
}

export function useAdminVerifiedNIN(
  params: any,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["adminVerifiedNIN", params],
    queryFn: async () => {
      const [response, error] = await getAdminVerifiedNIN(params);
      if (error) throw error;
      return response;
    },
    enabled: options?.enabled,
  });
}

export function useBranchDuesPayments(
  params: any,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["branchDuesPayments", params],
    queryFn: async () => {
      const [response, error] = await getBranchDuesPayments(params);
      if (error) throw error;
      return response;
    },
    enabled: options?.enabled,
  });
}

// Notification Hooks
export function useNotifications(params: any, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.notifications.list(params),
    queryFn: async () => {
      const [response, error] = await getNotifications(params);
      if (error) throw error;
      return response;
    },
    enabled: options?.enabled,
    refetchInterval: 30000, // Poll every 30 seconds
  });
}

export function useUnreadNotificationCount(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: async () => {
      const [response, error] = await getUnreadNotificationCount();
      if (error) throw error;
      return response;
    },
    enabled: options?.enabled,
    refetchInterval: 30000, // Poll every 30 seconds
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) =>
      markNotificationAsRead(id).then(([res, err]) => {
        if (err) throw err;
        return res;
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all,
      });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      markAllNotificationsAsRead().then(([res, err]) => {
        if (err) throw err;
        return res;
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all,
      });
    },
  });
}

// Detail View Hooks
export function useAdminConferenceDetails(
  id: string | number,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["adminConference", id],
    queryFn: () =>
      getAdminConferenceDetails(id).then(([res, err]) => {
        if (err) throw err;
        return res;
      }),
    enabled: !!id && options?.enabled,
  });
}

export function useAdminBranchDetails(
  code: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["adminBranch", code],
    queryFn: () =>
      getAdminBranchDetails(code).then(([res, err]) => {
        if (err) throw err;
        return res;
      }),
    enabled: !!code && options?.enabled,
  });
}

export function useAdminLawyerDetails(
  id: string | number,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["adminLawyer", id],
    queryFn: () =>
      getAdminLawyerDetails({ id }).then(([res, err]) => {
        if (err) throw err;
        return res;
      }),
    enabled: !!id && options?.enabled,
  });
}

export function useAdminTransactionDetails(
  id: string | number,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["adminTransaction", id],
    queryFn: () =>
      getAdminTransactionDetails(id).then(([res, err]) => {
        if (err) throw err;
        return res;
      }),
    enabled: !!id && options?.enabled,
  });
}

export function useAdminVerifiedNINDetails(
  id: string | number,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["adminVerifiedNIN", id],
    queryFn: () =>
      getAdminVerifiedNINDetails({ id }).then(([res, err]) => {
        if (err) throw err;
        return res;
      }),
    enabled: !!id && options?.enabled,
  });
}

export function useCategoryDetails(
  id: string | number,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["conferenceCategory", id],
    queryFn: () =>
      getCategoryDetails(id).then(([res, err]) => {
        if (err) throw err;
        return res;
      }),
    enabled: !!id && options?.enabled,
  });
}

export function useConferencePayments(
  params: any,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["conferencePayments", params],
    queryFn: async () => {
      const [response, error] = await getConferencePayments(params);
      if (error) throw error;
      return response;
    },
    enabled: options?.enabled,
  });
}

export function useAdminStampSealTypeDetails(
  id: string | number,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["adminStampSealType", id],
    queryFn: () =>
      getAdminStampSealTypeDetails(id).then(([res, err]) => {
        if (err) throw err;
        return res;
      }),
    enabled: !!id && options?.enabled,
  });
}

export function useUpdateAdminStampSealOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string | number; body: any }) =>
      updateAdminStampSealOrderStatus({ id, ...body }).then(([res, err]) => {
        if (err) throw err;
        return res;
      }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["adminStampSealOrders"] });
    },
  });
}

export function useVerifyAdminStampSealOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string | number; body: any }) =>
      verifyAdminStampSealOrder({ id, ...body }).then(([res, err]) => {
        if (err) throw err;
        return res;
      }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["adminStampSealOrders"] });
    },
  });
}

export function useMarkAdminStampSealOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string | number; body: any }) =>
      markAdminStampSealOrder({ id, ...body }).then(([res, err]) => {
        if (err) throw err;
        return res;
      }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["adminStampSealOrders"] });
    },
  });
}
/**
 * React Query Configuration
 * Centralized caching and data fetching strategy
 *
 * Already installed: @tanstack/react-query@5.90.7
 */

/**
 * Custom QueryClient configuration
 * Optimized for the NBA Portal's caching needs
 */
export const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      // OPTIMIZED: Aggressive caching for faster UX
      staleTime: 10 * 60 * 1000, // 10 minutes - data stays fresh longer
      gcTime: 30 * 60 * 1000, // 30 minutes - keep in memory longer

      // Smart retry strategy
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // OPTIMIZED: Reduce unnecessary refetches
      refetchOnWindowFocus: false, // Don't refetch on tab focus (reduces API calls)
      refetchOnMount: false, // Use cached data on mount
      refetchOnReconnect: true, // Only refetch when connection restored

      // PERFORMANCE: Placeholder data shows instantly
      placeholderData: (previousData: any) => previousData, // Show stale data while fetching
    },

    mutations: {
      retry: 1,
      retryDelay: 100,
    },
  },
};

/**
 * Create and configure QueryClient
 */
export function createQueryClient() {
  const client = new QueryClient(queryClientConfig);

  // Optional: Add error handling
  const errorHandler = (error: Error) => {
    logger.error("Query error", error);
  };

  return client;
}

/**
 * Pre-defined query keys for type-safe caching
 * Prevents duplicate queries and makes cache management easier
 */
export const queryKeys = {
  // Lawyer management
  lawyers: {
    all: ["lawyers"] as const,
    list: (filters: any) =>
      [...queryKeys.lawyers.all, "list", filters] as const,
    detail: (id: number) => [...queryKeys.lawyers.all, "detail", id] as const,
  },

  // Branch management
  branches: {
    all: ["branches"] as const,
    list: (filters: any) =>
      [...queryKeys.branches.all, "list", filters] as const,
    detail: (id: number) => [...queryKeys.branches.all, "detail", id] as const,
  },

  // Transactions
  transactions: {
    all: ["transactions"] as const,
    list: (filters: any) =>
      [...queryKeys.transactions.all, "list", filters] as const,
    detail: (id: string) =>
      [...queryKeys.transactions.all, "detail", id] as const,
  },

  // Stamp & Seal
  stampSeal: {
    all: ["stampSeal"] as const,
    list: (filters: any) =>
      [...queryKeys.stampSeal.all, "list", filters] as const,
    metrics: () => [...queryKeys.stampSeal.all, "metrics"] as const,
  },

  // Conference
  conference: {
    all: ["conference"] as const,
    list: (filters: any) =>
      [...queryKeys.conference.all, "list", filters] as const,
  },

  // Dashboard
  dashboard: {
    user: () => ["dashboard", "user"] as const,
    admin: (year: string) => ["dashboard", "admin", year] as const,
  },

  // User Profile
  profile: {
    me: () => ["profile", "me"] as const,
    nin: () => ["profile", "nin"] as const,
  },

  // Auth
  auth: {
    me: () => ["auth", "me"] as const,
    roles: () => ["auth", "roles"] as const,
  },

  // Notifications
  notifications: {
    all: ["notifications"] as const,
    list: (filters: any) =>
      [...queryKeys.notifications.all, "list", filters] as const,
    unreadCount: () => [...queryKeys.notifications.all, "unreadCount"] as const,
  },
};

/**
 * Usage Example:
 *
 * import { useQuery } from '@tanstack/react-query';
 * import { queryKeys } from '@/api/react-query';
 *
 * function LawyerList() {
 *   const { data, isLoading } = useQuery({
 *     queryKey: queryKeys.lawyers.list({ page: 1, search: '' }),
 *     queryFn: () => getLawyers({ page: 1 }),
 *     staleTime: 5 * 60 * 1000,
 *   });
 * }
 */
