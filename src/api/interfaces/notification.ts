export interface INotification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
  user_id: number;
  data?: any;
}

export interface INotificationFilters {
  page: number;
  limit: number;
  isRead?: boolean;
  type?: string;
}

export interface INotificationResponse {
  pagination: {
    page_size: number;
    total_rows: number;
    page: number;
  };
  items: INotification[];
}

export interface IUnreadCountResponse {
  unread_count: number;
}
