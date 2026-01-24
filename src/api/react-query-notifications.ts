import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "./notifications";
import {
  INotificationFilters,
  INotificationResponse,
  IUnreadCountResponse,
} from "./interfaces/notification";
import { NotifySuccess, NotifyError } from "@/components/toast/toast";

/**
 * Hook to fetch notifications with filters
 */
export function useNotifications(filters: INotificationFilters) {
  return useQuery<INotificationResponse>({
    queryKey: ["notifications", filters],
    queryFn: async () => {
      const [data, error] = await getNotifications(filters);
      if (error) {
        throw error;
      }
      return data;
    },
    staleTime: 30000, // Data is fresh for 30 seconds
    refetchInterval: 60000, // Refetch every minute to get new notifications
  });
}

/**
 * Hook to fetch unread notification count
 */
export function useUnreadNotificationCount() {
  return useQuery<IUnreadCountResponse>({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const [data, error] = await getUnreadNotificationCount();
      if (error) {
        throw error;
      }
      return data;
    },
    staleTime: 20000, // Data is fresh for 20 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

/**
 * Hook to mark a notification as read
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: number) => {
      const [data, error] = await markNotificationAsRead(notificationId);
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: any) => {
      NotifyError(error?.message || "Failed to mark notification as read");
    },
  });
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const [data, error] = await markAllNotificationsAsRead();
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch all notification queries
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      NotifySuccess("All notifications marked as read");
    },
    onError: (error: any) => {
      NotifyError(error?.message || "Failed to mark all notifications as read");
    },
  });
}
