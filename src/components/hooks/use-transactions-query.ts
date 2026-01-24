/**
 * React Query hooks for transactions management
 * Provides optimized data fetching with automatic caching
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTransaction } from "@/api/transaction";
import {
  verifyPayment,
  verifyBranchDuesPayment,
  verifyStampAndSealPayment,
  verifyPaymentByReference,
} from "@/api/payment";
import { queryKeys } from "@/api/react-query";
import {
  ITransactionResponse,
  ITransactionProps,
} from "@/api/interfaces/transaction";
import { logger } from "@/utils/logger";

/**
 * Fetch transactions with automatic caching and refetching
 */
export function useTransactionsQuery(
  filters: ITransactionProps,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.transactions.list(filters),
    queryFn: async () => {
      try {
        logger.debug("Fetching transactions with filters", filters);
        const [response, error] = await getTransaction(filters);

        if (error) {
          logger.error("Failed to fetch transactions", error);
          throw error;
        }

        return response as ITransactionResponse;
      } catch (error) {
        logger.error("Transactions query error", error);
        throw error;
      }
    },
    staleTime: 3 * 60 * 1000, // 3 minutes (transactions change frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
    enabled: options?.enabled,
  });
}

/**
 * Fetch admin transactions with automatic caching
 */
export function useAdminTransactionsQuery(filters: any) {
  return useQuery({
    queryKey: ["adminTransactions", filters],
    queryFn: async () => {
      try {
        const { getAdminTransaction } = await import("@/api/transaction");
        const [response, error] = await getAdminTransaction(filters);
        if (error) throw error;
        return response as ITransactionResponse;
      } catch (error) {
        logger.error("Admin transactions query error", error);
        throw error;
      }
    },
    staleTime: 3 * 60 * 1000,
  });
}

/**
 * Verify payment transaction
 */
export function useVerifyPaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ref,
      transactionId,
      type,
    }: {
      ref: string;
      transactionId?: string;
      type?: string;
    }) => {
      logger.debug("Verifying payment", { ref, transactionId, type });

      // const payload: any = { reference: ref };
      // if (transactionId) payload.transaction_id = transactionId;

      const [response, error] = await verifyPaymentByReference(ref);

      if (error) {
        logger.error("Failed to verify payment", error);
        throw error;
      }

      return response;
    },
    onSuccess: () => {
      logger.debug("Payment verified successfully", {});
      // Invalidate all transaction queries to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.transactions.all,
      });
      queryClient.invalidateQueries({
        queryKey: ["adminTransactions"],
      });
    },
    onError: (error) => {
      logger.error("Payment verification failed", error);
    },
  });
}

/**
 * Prefetch transactions for pagination
 */
export function usePrefetchTransactions() {
  const queryClient = useQueryClient();

  return async (filters: ITransactionProps) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.transactions.list(filters),
      queryFn: async () => {
        const [response, error] = await getTransaction(filters);
        if (error) throw error;
        return response as ITransactionResponse;
      },
      staleTime: 3 * 60 * 1000,
    });
  };
}
