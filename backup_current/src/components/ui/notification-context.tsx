import { createContext, useContext } from 'react';

type NotificationType = 'success' | 'error' | 'info';

type Notification = {
  id: string;
  type: NotificationType;
  message: string;
};

type NotificationContextType = {
  notifications: Notification[];
  showNotification: (type: NotificationType, message: string) => void;
  removeNotification: (id: string) => void;
};

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
