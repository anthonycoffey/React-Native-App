import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { StoredNotification } from '@/hooks/useNotifications';

const NOTIFICATIONS_STORAGE_KEY = 'notifications';

interface NotificationsContextData {
  notifications: StoredNotification[];
  unreadCount: number;
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

  const loadNotifications = async () => {
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
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const refreshNotifications = () => {
    loadNotifications();
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const updatedNotifications = notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      setNotifications(updatedNotifications);
      setUnreadCount(updatedNotifications.filter(n => !n.read).length);
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotifications));
    } catch (e) {
      console.error('Failed to mark notification as read.', e);
    }
  };

  const clearAll = async () => {
    try {
      await AsyncStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
      setNotifications([]);
      setUnreadCount(0);
    } catch (e) {
      console.error('Failed to clear notifications.', e);
    }
  };

  const markAllAsRead = async () => {
    try {
      const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
      setNotifications(updatedNotifications);
      setUnreadCount(0);
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotifications));
    } catch (e) {
      console.error('Failed to mark all notifications as read.', e);
    }
  };
  
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(() => {
      refreshNotifications();
    });
    return () => subscription.remove();
  }, []);

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    refreshNotifications,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}
