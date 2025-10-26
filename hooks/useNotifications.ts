import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '@/utils/ApiService';
import { useAuth } from '@/contexts/AuthContext';

const NOTIFICATIONS_STORAGE_KEY = 'notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => {
    const isAppActive = AppState.currentState === 'active';
    return {
      shouldShowAlert: !isAppActive,
      shouldPlaySound: !isAppActive,
      shouldSetBadge: false,
      shouldShowBanner: false, // for android
      shouldShowList: false, // for ios
    };
  },
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
  // if (Device.isDevice) {
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
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(`[Notifications] Got Expo push token: ${token}`);
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
  // } else {
  //   // console.log('Must use physical device for Push Notifications');
  // }

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

async function saveNotification(notification: Notifications.Notification) {
  try {
    const existingNotifications = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    const notifications: StoredNotification[] = existingNotifications ? JSON.parse(existingNotifications) : [];

    const newNotification: StoredNotification = {
      id: notification.request.identifier,
      date: new Date().toISOString(),
      title: notification.request.content.title,
      body: notification.request.content.body,
      read: false,
    };

    notifications.unshift(newNotification);
    await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  } catch (e) {
    console.error('Failed to save notification.', e);
  }
}


export function useNotifications() {
  const auth = useAuth();
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
        saveNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
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
