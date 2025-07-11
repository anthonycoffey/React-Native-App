import React from 'react';
import * as Notifications from 'expo-notifications';
import { PrimaryButton } from '@/components/Buttons';

const TestNotificationButton = () => {
  const sendTestNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Notification",
        body: "This is a test in-app notification.",
        data: { test: 'data' },
      },
      trigger: null, // send immediately
    });
  };

  return (
    <PrimaryButton
      onPress={sendTestNotification}
      title="Send Test Notification"
    />
  );
};

export default TestNotificationButton;
