import React from 'react';
import { PrimaryButton } from '@/components/Buttons';
import { apiService } from '@/utils/ApiService';
import { useAuth } from '@/contexts/AuthContext';

const TestNotificationButton = () => {
  const { session } = useAuth();
  const sendTestNotification = async () => {
    if (!session) {
      console.error('No session found, cannot send test notification');
      return;
    }
    try {
      console.log('Sending test notification to backend...');
      const response = await apiService.post('/notifications/expo/test', {
        title: 'Test Notification',
        body: 'This is a test push notification from the app.',
      });
      console.log('Test notification response:', response);
    } catch (error) {
      console.error('Failed to send test notification', error);
    }
  };

  return (
    <PrimaryButton
      onPress={sendTestNotification}
      title="Send Test Notification"
    />
  );
};

export default TestNotificationButton;
