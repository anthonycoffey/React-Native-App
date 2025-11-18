import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { apiService } from '@/utils/ApiService';
import { useAuth } from '@/contexts/AuthContext';
import { useNotificationsContext } from '@/contexts/NotificationsContext';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: AppState.currentState !== 'active',
    shouldShowList: AppState.currentState !== 'active',
    shouldPlaySound: AppState.currentState !== 'active',
    shouldSetBadge: true,
  }),
});

export interface StoredNotification {
  id: string;
  date: string;
  title: string | null;
  body: string | null;
  read: boolean;
}

async function registerForPushNotificationsAsync(session: string | null) {
  console.log('[Notifications] Starting registration process...');
  let token;
  if (Device.isDevice) {
    console.log('[Notifications] Device is a physical device.');
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    console.log(`[Notifications] Existing permission status: ${existingStatus}`);
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      console.log('[Notifications] Permission not granted, requesting...');
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log(`[Notifications] New permission status: ${finalStatus}`);
    }
    if (finalStatus !== 'granted') {
      console.log(
        '[Notifications] Failed to get push token for push notification!'
      );
      return;
    }
    try {
      console.log('[Notifications] Getting push token...');
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
      })).data;
      console.log(`[Notifications] Got Expo push token: ${token}`);
    } catch (error) {
      console.error('[Notifications] Failed to get push token:', error);
      return;
    }
    if (token && session) {
      try {
        console.log('[Notifications] Subscribing to backend...');
        const response = await apiService.post('/notifications/expo/subscribe', {
          token,
        });
        console.log(
          '[Notifications] Successfully subscribed to backend. Response:',
          response
        );
      } catch (error) {
        console.error(
          '[Notifications] Failed to subscribe to push notifications:',
          error
        );
      }
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

export function useNotifications() {
  const auth = useAuth();
  const { addNotification } = useNotificationsContext();
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    console.log(
      `[Notifications] useEffect triggered. Session: ${auth?.session}`
    );
    if (auth?.session) {
      registerForPushNotificationsAsync(auth.session);
    }

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        if (AppState.currentState === 'active') {
          const newNotification: StoredNotification = {
            id: notification.request.identifier,
            date: new Date().toISOString(),
            title: notification.request.content.title,
            body: notification.request.content.body,
            read: false,
          };
          addNotification(newNotification);
        }
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const link = response.notification.request.content.data?.link;
        if (typeof link === 'string' && link) {
          router.push(link as any);
        }
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [auth?.session]);
}
