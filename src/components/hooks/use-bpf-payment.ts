import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  getBPFHistory, 
  getBranchDuesHistory,
  getTransactionStatus, 
  paymentInvoice 
} from "@/api/payment";
import { logger } from "@/utils/logger";

export const bpfKeys = {
  all: ["bpf"] as const,
  history: (params: any) => [...bpfKeys.all, "history", params] as const,
  status: (params: any) => [...bpfKeys.all, "status", params] as const,
};

export const branchDuesKeys = {
  all: ["branch-dues"] as const,
  history: (params: any) => [...branchDuesKeys.all, "history", params] as const,
  status: (params: any) => [...branchDuesKeys.all, "status", params] as const,
};

export function useBPFHistory(params?: any, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: bpfKeys.history(params),
    queryFn: async () => {
      const [response, error] = await getBPFHistory(params);
      if (error) throw error;
      return response;
    },
    enabled: options?.enabled,
  });
}

export function useBranchDuesHistory(params?: any, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: branchDuesKeys.history(params),
    queryFn: async () => {
      const [response, error] = await getBranchDuesHistory(params);
      if (error) throw error;
      return response;
    },
    enabled: options?.enabled,
  });
}

export function useBPFStatus(params?: any, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: bpfKeys.status(params),
    queryFn: async () => {
      const [response, error] = await getTransactionStatus(params);
      if (error) throw error;
      return response;
    },
    enabled: options?.enabled,
  });
}

export function useInitializeBPFPayment() {
  return useMutation({
    mutationFn: async (data: any) => {
      const [response, error] = await paymentInvoice(data);
      if (error) throw error;
      return response;
    },
  });
}
