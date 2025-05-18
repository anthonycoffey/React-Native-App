import React, { useEffect } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Tabs, useRouter, Redirect, Link } from 'expo-router';
import { ActivityIndicator, View, Pressable } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useAuth } from '@/contexts/AuthContext';
import globalStyles from '@/styles/globalStyles';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof MaterialIcons>['name'];
  color: string;
}) {
  return <MaterialIcons size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const auth = useAuth();
  const router = useRouter();
  const headerShown = useClientOnlyValue(false, true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (auth && !auth.isLoading && !auth.session) {
      const redirectTimeout = setTimeout(() => {
        router.replace('/login');
      }, 0);
      return () => clearTimeout(redirectTimeout);
    }
  }, [auth, router]);

  // Show loading spinner while checking auth or if auth context is not yet available
  if (!auth || auth.isLoading) {
    return (
      <View style={globalStyles.loadingContainer}>
        <ActivityIndicator
          size='large'
          color={Colors[colorScheme ?? 'light'].tint}
        />
      </View>
    );
  }

  // If not authenticated and not loading, redirect to login
  if (!auth.session && !auth.isLoading) {
    return <Redirect href='/login' />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: headerShown,
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: 'My Jobs',
          tabBarIcon: ({ color }) => <TabBarIcon name='list' color={color} />,
          headerRight: () => (
            <Link href='/dashboard/create-job' asChild>
              <Pressable>
                {({ pressed }) => (
                  <MaterialIcons
                    name='add-circle-outline'
                    size={25}
                    color={Colors[colorScheme ?? 'light'].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name='go-online'
        options={{
          title: 'Go Online',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name='location-on' color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='account'
        options={{
          title: 'My Account',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <TabBarIcon name='account-circle' color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='create-job'
        options={{
          title: 'Create Job',
          href: null,
        }}
      />
    </Tabs>
  );
}
