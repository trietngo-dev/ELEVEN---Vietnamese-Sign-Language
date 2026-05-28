import { tokenStorage } from "./auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export interface NotificationItem {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
  readAt?: string;
}

export const notificationsApi = {
  // Fetch all notifications from paged endpoint and filter by user locally
  getUserNotifications: async (userId: number): Promise<NotificationItem[]> => {
    const token = tokenStorage.getToken();
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications?page=1&pageSize=100`, { headers });
      if (!response.ok) return [];

      const pagedResult = await response.json();
      const items: NotificationItem[] = pagedResult.items || [];
      
      // Filter by current user ID and sort by newest first
      return items
        .filter(n => n.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (e) {
      console.error("Error fetching notifications", e);
      return [];
    }
  },

  // Create a new notification for a specific user
  createNotification: async (
    userId: number,
    title: string,
    message: string,
    type: "subscription" | "learning" | "system",
    actionUrl?: string
  ): Promise<NotificationItem | null> => {
    const token = tokenStorage.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          userId,
          title,
          message,
          type,
          isRead: false,
          actionUrl
        })
      });

      if (!response.ok) return null;
      return response.json();
    } catch (e) {
      console.error("Error creating notification", e);
      return null;
    }
  },

  // Mark a notification as read using PUT
  markAsRead: async (id: number, item: NotificationItem): Promise<boolean> => {
    const token = tokenStorage.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          title: item.title,
          message: item.message,
          type: item.type,
          isRead: true,
          actionUrl: item.actionUrl,
          readAt: new Date().toISOString()
        })
      });

      return response.ok;
    } catch (e) {
      console.error("Error marking notification as read", e);
      return false;
    }
  }
};
