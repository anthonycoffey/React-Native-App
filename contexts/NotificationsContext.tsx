import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { StoredNotification } from '@/hooks/useNotifications';

const NOTIFICATIONS_STORAGE_KEY = 'notifications';

interface NotificationsContextData {
  notifications: StoredNotification[];
  unreadCount: number;
  addNotification: (notification: StoredNotification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  refreshNotifications: () => void;
}

const NotificationsContext = createContext<NotificationsContextData | undefined>(undefined);

export function useNotificationsContext() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotificationsContext must be used within a NotificationsProvider');
  }
  return context;
}

interface NotificationsProviderProps {
  children: ReactNode;
}

export function NotificationsProvider({ children }: NotificationsProviderProps) {
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    try {
      const storedNotifications = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (storedNotifications) {
        const parsedNotifications: StoredNotification[] = JSON.parse(storedNotifications);
        setNotifications(parsedNotifications);
        setUnreadCount(parsedNotifications.filter(n => !n.read).length);
      }
    } catch (e) {
      console.error('Failed to load notifications.', e);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const refreshNotifications = useCallback(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      setNotifications(prevNotifications => {
        const updatedNotifications = prevNotifications.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        );
        setUnreadCount(updatedNotifications.filter(n => !n.read).length);
        AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotifications));
        return updatedNotifications;
      });
    } catch (e) {
      console.error('Failed to mark notification as read.', e);
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
      setNotifications([]);
      setUnreadCount(0);
    } catch (e) {
      console.error('Failed to clear notifications.', e);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      setNotifications(prevNotifications => {
        const updatedNotifications = prevNotifications.map(n => ({ ...n, read: true }));
        AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotifications));
        return updatedNotifications;
      });
      setUnreadCount(0);
    } catch (e) {
      console.error('Failed to mark all notifications as read.', e);
    }
  }, []);
  
  const addNotification = useCallback(async (notification: StoredNotification) => {
    try {
      setNotifications(prevNotifications => {
        const updatedNotifications = [notification, ...prevNotifications];
        AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotifications));
        return updatedNotifications;
      });
      setUnreadCount(prev => prev + 1);
    } catch (e) {
      console.error('Failed to add notification.', e);
    }
  }, []);

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    refreshNotifications,
  }), [notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearAll, refreshNotifications]);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}
