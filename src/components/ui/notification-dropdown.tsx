import { FunctionalComponent, Fragment } from "preact";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { INotification } from "@/api/interfaces/notification";
import { formatDistanceToNow } from "date-fns";

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications?: INotification[];
  unreadCount?: number;
  totalCount?: number;
  onMarkAsRead: (id: number) => void;
  onMarkAllAsRead: () => void;
  isLoading?: boolean;
}

const NotificationDropdown: FunctionalComponent<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  notifications = [],
  unreadCount = 0,
  onMarkAsRead,
  onMarkAllAsRead,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Notification Dropdown */}
      <div className="absolute right-0 top-16 z-50 w-[380px] bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-sm text-primary-500 font-medium hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="px-4 py-8 text-center text-gray-500">
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500">
              No notifications yet
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !notification.is_read ? "bg-blue-50" : ""
                }`}
                onClick={() => {
                  if (!notification.is_read) {
                    onMarkAsRead(notification.id);
                  }
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 mb-1">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                      {notification.message}
                    </p>
                    {notification.data?.actionLink && (
                      <a
                        href={notification.data.actionLink}
                        className="text-xs text-primary-500 hover:underline inline-block mb-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {notification.data.actionText || "View Details"}
                      </a>
                    )}
                    <p className="text-[10px] text-gray-400">
                      {notification.created_at
                        ? formatDistanceToNow(
                            new Date(notification.created_at),
                            { addSuffix: true }
                          )
                        : ""}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <div className="w-2 h-2 bg-primary-500 rounded-full ml-2 mt-1 flex-shrink-0" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <a
            href="/notifications"
            className="text-sm text-primary-500 font-medium hover:underline block text-center"
          >
            See all notifications
          </a>
        </div>
      </div>
    </>
  );
};

export default NotificationDropdown;
