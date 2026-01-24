import { FunctionalComponent } from "preact";
import { useState } from "preact/hooks";
import PageTitle from "@/components/ui/page-title";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { INotification } from "@/api/interfaces/notification";
import { formatDistanceToNow } from "date-fns";
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from "@/api/react-query-notifications";
import PageLoader from "@/components/ui/page-loader";
import Button from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";

const NotificationsPage: FunctionalComponent = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [filterType, setFilterType] = useState<string | undefined>(undefined);
  const [filterRead, setFilterRead] = useState<boolean | undefined>(undefined);

  // Fetch notifications
  const {
    data: notificationsData,
    isLoading,
    error,
    refetch,
  } = useNotifications({
    page,
    limit,
    type: filterType,
    isRead: filterRead,
  });

  // Mutations
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();

  const notifications = notificationsData?.notifications || [];
  const pagination = notificationsData?.pagination;

  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const getCategoryColor = (type?: string) => {
    switch (type?.toLowerCase()) {
      case "security":
        return "bg-red-50 border-l-4 border-red-500";
      case "payment":
        return "bg-green-50 border-l-4 border-green-500";
      case "alert":
        return "bg-yellow-50 border-l-4 border-yellow-500";
      case "update":
        return "bg-blue-50 border-l-4 border-blue-500";
      default:
        return "bg-gray-50 border-l-4 border-gray-300";
    }
  };

  const getCategoryIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case "security":
        return "🔒";
      case "payment":
        return "💳";
      case "alert":
        return "⚠️";
      case "update":
        return "📢";
      default:
        return "📌";
    }
  };

  return (
    <div className="px-4 mb-5">
      <PageTitle title="Notifications" />
      <h1 className="font-bold text-xl lg:text-2xl mt-7 mb-4">Notifications</h1>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-3 flex-wrap">
        <button
          onClick={() => {
            setFilterType(undefined);
            setFilterRead(undefined);
            setPage(1);
          }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filterType === undefined && filterRead === undefined
              ? "bg-primary-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        <button
          onClick={() => {
            setFilterType(undefined);
            setFilterRead(false);
            setPage(1);
          }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filterRead === false && filterType === undefined
              ? "bg-primary-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Unread
        </button>
        <button
          onClick={() => {
            setFilterType("PAYMENT");
            setFilterRead(undefined);
            setPage(1);
          }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filterType === "PAYMENT"
              ? "bg-primary-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Payments
        </button>
        <button
          onClick={() => {
            setFilterType("SECURITY");
            setFilterRead(undefined);
            setPage(1);
          }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filterType === "SECURITY"
              ? "bg-primary-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Security
        </button>
      </div>

      {/* Actions */}
      <div className="mb-6 flex gap-3 items-center">
        <Button
          dimension="sm"
          variant="outline"
          onClick={handleMarkAllAsRead}
          isLoading={markAllAsReadMutation.isPending}
          disabled={
            notifications.length === 0 || markAllAsReadMutation.isPending
          }
        >
          Mark all as read
        </Button>
        <button
          onClick={() => refetch()}
          className="text-sm text-gray-600 hover:text-gray-800"
          disabled={isLoading}
        >
          Refresh
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="w-full h-64 flex justify-center items-center">
          <PageLoader isOutlined={true} />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600 mb-2">Failed to load notifications</p>
          <Button dimension="sm" variant="primary" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      )}

      {/* Notifications List */}
      {!isLoading && !error && (
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-sm font-medium mb-2">
                No notifications yet
              </p>
              <p className="text-gray-400 text-xs">
                You'll see notifications here when there's activity on your
                account
              </p>
            </div>
          ) : (
            notifications.map((notification: INotification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg transition-all cursor-pointer hover:shadow-md ${getCategoryColor(
                  notification.type,
                )} ${!notification.is_read ? "shadow-sm" : ""}`}
                onClick={() => {
                  if (!notification.is_read) {
                    handleMarkAsRead(notification.id);
                  }
                }}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex gap-3 flex-1">
                    <span className="text-xl">
                      {getCategoryIcon(notification.type)}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm text-gray-800">
                          {notification.title}
                        </p>
                        {!notification.is_read && (
                          <span className="inline-block w-2 h-2 bg-primary-500 rounded-full" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] text-gray-500">
                          {formatDistanceToNow(
                            new Date(notification.created_at),
                            {
                              addSuffix: true,
                            },
                          )}
                        </p>
                        {notification.data?.actionLink && (
                          <a
                            href={notification.data.actionLink}
                            className="text-xs text-primary-500 hover:underline font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {notification.data.actionText || "View Details"}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !error && pagination && pagination.total_rows > limit && (
        <div className="mt-6">
          <Pagination
            state={{
              status: "",
              page: pagination.page,
              page_size: pagination.page_size,
              total_rows: pagination.total_rows,
              exam_year: "",
            }}
            onChange={(newPage) => setPage(newPage)}
            onChangeSize={(newSize) => {
              setLimit(newSize);
              setPage(1);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
