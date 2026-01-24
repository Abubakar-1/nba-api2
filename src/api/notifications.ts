import clientRequest from "./client";
import { handleRequest } from "./client/request";
import { API_CONFIG } from "./config";
import { INotificationFilters } from "./interfaces/notification";

const BASE_URL = API_CONFIG.AUTH_API;

/**
 * Get user notifications
 * GET /notifications
 */
function getNotifications(data: INotificationFilters) {
  // Filter out undefined/null/empty values to keep the URL clean
  const params = new URLSearchParams(
    Object.entries(data).filter(([_, v]) => v != null && v !== "") as any
  );

  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).get(`/notifications?${params}`)
  );
}

/**
 * Get unread notifications count
 * GET /notifications/unread-count
 */
function getUnreadNotificationCount() {
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).get("/notifications/unread-count")
  );
}

/**
 * Mark notification as read
 * PATCH /notifications/{notificationId}/read
 */
function markNotificationAsRead(id: number | string) {
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).patch(`/notifications/${id}/read`)
  );
}

/**
 * Mark all notifications as read
 * PATCH /notifications/mark-all-read
 */
function markAllNotificationsAsRead() {
  return handleRequest(() =>
    clientRequest({
      headers: { "ngrok-skip-browser-warning": "your-value" },
      baseURL: BASE_URL,
    }).patch("/notifications/mark-all-read")
  );
}

export {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
