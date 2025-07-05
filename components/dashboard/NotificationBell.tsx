import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useNotificationsContext } from '@/contexts/NotificationsContext';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function NotificationBell() {
  const { unreadCount } = useNotificationsContext();
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <Link href="/dashboard/notifications" asChild>
      <Pressable>
        {({ pressed }) => (
          <View style={styles.container}>
            <MaterialIcons
              name="notifications"
              size={25}
              color={Colors[colorScheme].text}
              style={{ opacity: pressed ? 0.5 : 1 }}
            />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
        )}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 15,
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -3,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
