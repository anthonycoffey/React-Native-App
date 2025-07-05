import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/contexts/AuthContext';
import { UserProvider } from '@/contexts/UserContext';
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import { useNotifications } from '@/hooks/useNotifications';
import { JobScreenParams } from '../types';
import { useColorScheme } from '@/components/useColorScheme';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? 'light';

  useNotifications();

  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
    if (loaded) SplashScreen.hideAsync();
  }, [error, loaded]);

  if (!loaded) return null;

  return (
    <AuthProvider>
      <UserProvider>
        <NotificationsProvider>
          <SafeAreaProvider>
            <ThemeProvider
              value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
            >
              <Stack>
                <Stack.Screen name='dashboard' options={{ headerShown: false , title: 'Dashboard'}} />
                <Stack.Screen
                  name='job/[id]'
                  options={({ route }) => ({
                    title: `J-${(route.params as JobScreenParams)?.id}`,
                    headerBackVisible: true,
                  })}
                />
                <Stack.Screen name='login' options={{ headerShown: false }} />
                <Stack.Screen name='register' options={{ headerShown: false }} />
                <Stack.Screen name='lost-password' options={{ headerShown: false }} />
                <Stack.Screen
                  name='location-permission'
                  options={{ headerShown: false }}
                />
              </Stack>
            </ThemeProvider>
          </SafeAreaProvider>
        </NotificationsProvider>
      </UserProvider>
    </AuthProvider>
  );
}
