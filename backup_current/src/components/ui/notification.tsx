'use client';

import { X } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { NotificationContext } from './notification-context';

type NotificationType = 'success' | 'error' | 'info';

type Notification = {
  id: string;
  type: NotificationType;
  message: string;
};

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const showNotification = useCallback((type: NotificationType, message: string) => {
    const id = Math.random().toString(36).substring(7);
    setNotifications(prev => [...prev, { id, type, message }]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  }, [removeNotification]);

  const contextValue = useMemo(
    () => ({ notifications, showNotification, removeNotification }),
    [notifications, showNotification, removeNotification],
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`flex items-center justify-between rounded-lg p-4 shadow-lg ${
              notification.type === 'error'
                ? 'bg-red-100 text-red-800'
                : notification.type === 'success'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'
            }`}
          >
            <span>{notification.message}</span>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-4 rounded-full p-1 hover:bg-black/5"
              type="button"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}
