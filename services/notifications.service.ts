import { axiosInstance } from "@/lib/ApiClient";
import { BaseService } from "./base.service";
import { CreateNotificationDto } from "../../Server/src/modules/notifications/dto/notifications.dto";

// Define interface for the notification data structure
interface Notification {
  id: string;
  user: string;
  message: string;
  type: 'info' | 'warning' | 'action';
  link?: string;
  read: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export class NotificationService extends BaseService {
  constructor() {
    super(axiosInstance, "/api/v1/notifications");
  }

  // Get notifications for a specific user
  async getUserNotifications(userId: string): Promise<Notification[]> {
    return this.get<Notification[]>(`/?userId=${userId}`);
  }

  // Create and send a new notification
  async send(user: string, message: string, type: 'info' | 'warning' | 'action', link?: string): Promise<Notification> {
    return this.post<Notification>("/", { user, message, type, link });
  }

  // Mark a notification as read
  async markAsRead(id: string): Promise<Notification> {
    return this.put<Notification>(`/${id}/read`, {});
  }

  // Delete a notification
  //ahad bhai check this error
  async delete(id: string): Promise<any> {
    return this.delete<void>(`/${id}`);
  }

  // Get the count of unread notifications for a user
  async getUnreadCount(userId: string): Promise<number> {
    return this.get<number>(`/unread-count?userId=${userId}`);
  }
}