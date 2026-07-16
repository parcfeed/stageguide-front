export interface NotificationItem {
  id: string;
  titre: string;
  message: string;
  estLue: boolean;
  createdAt: string;
  type?: string;
}

export interface NotificationsListResponse {
  utilisateurId: string;
  notifications: NotificationItem[];
}
