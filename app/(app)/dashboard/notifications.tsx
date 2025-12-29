import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Button,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { useNotificationsContext } from '@/contexts/NotificationsContext';
import { StoredNotification } from '@/hooks/useNotifications';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { formatDateTime } from '@/utils/dates';

export default function NotificationsScreen() {
  const { notifications, markAllAsRead, clearAll, refreshNotifications } =
    useNotificationsContext();
  const colorScheme = useColorScheme() ?? 'light';

  useFocusEffect(
    React.useCallback(() => {
      markAllAsRead();
    }, [markAllAsRead])
  );

  const renderItem = ({ item }: { item: StoredNotification }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          if (item.link) {
            router.push(item.link as any);
          }
        }}
        disabled={!item.link}
      >
        <View
          style={[
            styles.notificationItem,
            { backgroundColor: Colors[colorScheme].card },
          ]}
        >
          <Text
            style={[
              styles.notificationTitle,
              { color: Colors[colorScheme].text },
            ]}
          >
            {item.title}
          </Text>
          <Text style={{ color: Colors[colorScheme].text }}>{item.body}</Text>
          <Text style={styles.notificationDate}>
            {formatDateTime(item.date) || 'Invalid Date'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

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
