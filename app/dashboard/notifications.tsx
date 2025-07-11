import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Button } from 'react-native';
import { useNotificationsContext } from '@/contexts/NotificationsContext';
import { StoredNotification } from '@/hooks/useNotifications';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { formatDateTime } from '@/utils/dates';

export default function NotificationsScreen() {
  const { notifications, markAllAsRead, clearAll, refreshNotifications } =
    useNotificationsContext();
  const colorScheme = useColorScheme() ?? 'light';

  useEffect(() => {
    // Mark all as read when the screen is viewed
    markAllAsRead();
  }, [markAllAsRead]);

  const renderItem = ({ item }: { item: StoredNotification }) => (
    <View
      style={[
        styles.notificationItem,
        { backgroundColor: Colors[colorScheme].card },
      ]}
    >
      <Text
        style={[styles.notificationTitle, { color: Colors[colorScheme].text }]}
      >
        {item.title}
      </Text>
      <Text style={{ color: Colors[colorScheme].text }}>{item.body}</Text>
      <Text style={styles.notificationDate}>
        {formatDateTime(item.date) || 'Invalid Date'}
      </Text>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <Button title='Clear All' onPress={clearAll} />
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        onRefresh={refreshNotifications}
        refreshing={false}
        ListEmptyComponent={
          <Text
            style={{
              color: Colors[colorScheme].text,
              textAlign: 'center',
              marginTop: 20,
            }}
          >
            No notifications
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  notificationItem: {
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  notificationDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
});
