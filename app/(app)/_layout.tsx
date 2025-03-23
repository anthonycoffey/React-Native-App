import React, { useEffect } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Link, Tabs, useRouter, Redirect } from 'expo-router';
import { Pressable, ActivityIndicator, View } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useAuth } from '@/contexts/AuthContext';
import globalStyles from '@/styles/globalStyles';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof MaterialIcons>['name'];
  color: string;
}) {
  return <MaterialIcons size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const headerShown = useClientOnlyValue(false, true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !session) {
      // Use setTimeout with 0ms to push this to the end of the execution queue
      // This gives time for any auth state changes to fully propagate
      const redirectTimeout = setTimeout(() => {
        router.replace('/login');
      }, 0);
      
      return () => clearTimeout(redirectTimeout);
    }
  }, [session, isLoading, router]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <View style={globalStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  // If not authenticated and not loading, redirect to login
  if (!session && !isLoading) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // Disable the static render of the header on web
        headerShown: headerShown,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Jobs',
          tabBarIcon: ({ color }) => <TabBarIcon name="list" color={color} />,
          headerRight: () => (
            <Link href="/newJob" asChild>
              <Pressable>
                {({ pressed }) => (
                  <MaterialIcons
                    name="add-circle"
                    size={25}
                    color={Colors[colorScheme ?? 'light'].tint}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="go-online"
        options={{
          title: 'Go Online',
          tabBarIcon: ({ color }) => <TabBarIcon name="location-on" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <TabBarIcon name="settings" color={color} />,
        }}
      />
    </Tabs>
  );
}
