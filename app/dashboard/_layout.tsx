import React, { useEffect } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Tabs, useRouter, Redirect, Link } from 'expo-router';
import { HeaderBackButton } from '@react-navigation/elements';
import { ActivityIndicator, View, Pressable } from 'react-native';
import NotificationBell from '@/components/dashboard/NotificationBell';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/contexts/AuthContext';
import globalStyles from '@/styles/globalStyles';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof MaterialIcons>['name'];
  color: string;
}) {
  return <MaterialIcons size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (auth && !auth.isLoading && !auth.session) {
      const redirectTimeout = setTimeout(() => {
        router.replace('/login');
      }, 0);
      return () => clearTimeout(redirectTimeout);
    }
  }, [auth, router]);

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

  if (!auth.session && !auth.isLoading) {
    return <Redirect href='/login' />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // headerShown: headerShown,
        headerStyle: {
          backgroundColor: Colors[colorScheme].card,
        },
        headerTintColor: Colors[colorScheme].text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: 'My Jobs',
          tabBarIcon: ({ color }) => <TabBarIcon name='list' color={color} />,
          headerLeft: () => (
            <Link href='/dashboard/create-job' asChild>
              <Pressable>
                {({ pressed }) => (
                  <MaterialIcons
                    name='add-circle-outline'
                    size={25}
                    color={Colors[colorScheme ?? 'light'].text}
                    style={{ marginHorizontal: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
          headerRight: () => (
            <NotificationBell />
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
          headerRight: () => (
            <NotificationBell />
          ),
        }}
      />
      <Tabs.Screen
        name='account/index'
        options={{
          title: 'My Account',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name='account-circle' color={color} />
          ),
          headerRight: () => <NotificationBell />,
        }}
      />
      <Tabs.Screen
        name='account/cash'
        options={{
          title: 'Cash Management',
          href: null,
          headerLeft: () => (
            <HeaderBackButton
              onPress={() => router.replace('/dashboard/account')}
              tintColor={Colors[colorScheme].text}
            />
          ),
          headerRight: () => <NotificationBell />,
        }}
      />
      <Tabs.Screen
        name='account/deposits/index'
        options={{
          title: 'Deposits',
          href: null,
          headerLeft: () => (
            <HeaderBackButton
              onPress={() => router.replace('/dashboard/account')}
              tintColor={Colors[colorScheme].text}
            />
          ),
          headerRight: () => <NotificationBell />,
        }}
      />
      <Tabs.Screen
        name='account/deposits/[id]'
        options={{
          title: 'Deposit Details',
          href: null,
          headerLeft: () => (
            <HeaderBackButton
              onPress={() => router.replace('/dashboard/account/deposits')}
              tintColor={Colors[colorScheme].text}
            />
          ),
          headerRight: () => <NotificationBell />,
        }}
      />
      <Tabs.Screen
        name='account/paychecks/index'
        options={{
          title: 'Paychecks',
          href: null,
          headerLeft: () => (
            <HeaderBackButton
              onPress={() => router.replace('/dashboard/account')}
              tintColor={Colors[colorScheme].text}
            />
          ),
          headerRight: () => <NotificationBell />,
        }}
      />
      <Tabs.Screen
        name='create-job'
        options={{
          title: 'Create Job',
          href: null,
          headerLeft: () => (
            <HeaderBackButton
              onPress={() => router.back()}
              tintColor={Colors[colorScheme].text}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='notifications'
        options={{
          title: 'Notifications',
          href: null,
          headerLeft: () => (
            <HeaderBackButton
              onPress={() => router.back()}
              tintColor={Colors[colorScheme].text}
            />
          ),
          headerRight: () => (
            <Pressable onPress={() => router.back()}>
              {({ pressed }) => (
                <MaterialIcons
                  name='close'
                  size={25}
                  color={Colors[colorScheme ?? 'light'].text}
                  style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                />
              )}
            </Pressable>
          ),
        }}
      />
    </Tabs>
  );
}
