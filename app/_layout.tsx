import { Theme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import Colors from '@/constants/Colors';
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
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://70100b46f675927bbe6a6ce24f378320@o4505751809884160.ingest.us.sentry.io/4509618064457728',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [
    Sentry.mobileReplayIntegration(),
    Sentry.feedbackIntegration(),
  ],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

function NotificationsWrapper({ children }: React.PropsWithChildren) {
  useNotifications();
  return <>{children}</>;
}

export default Sentry.wrap(function RootLayout() {
  const colorScheme = useColorScheme() ?? 'light';

  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
    if (loaded) SplashScreen.hideAsync();
  }, [error, loaded]);

  if (!loaded) return null;

  const customDarkTheme: Omit<Theme, 'fonts'> & { fonts: any } = {
    dark: true,
    colors: {
      primary: Colors.dark.tint,
      background: Colors.dark.background,
      card: Colors.dark.card,
      text: Colors.dark.text,
      border: Colors.dark.borderColor,
      notification: Colors.dark.tint,
    },
    fonts: {},
  };

  const customDefaultTheme: Omit<Theme, 'fonts'> & { fonts: any } = {
    dark: false,
    colors: {
      primary: Colors.light.tint,
      background: Colors.light.background,
      card: Colors.light.card,
      text: Colors.light.text,
      border: Colors.light.borderColor,
      notification: Colors.light.tint,
    },
    fonts: {},
  };

  return (
    <AuthProvider>
      <NotificationsProvider>
        <UserProvider>
          <NotificationsWrapper>
            <SafeAreaProvider>
              <ThemeProvider
                value={
                  colorScheme === 'dark' ? customDarkTheme : customDefaultTheme
                }
              >
                <Stack>
                  <Stack.Screen
                    name="dashboard"
                    options={{ headerShown: false, title: 'Dashboard' }}
                  />
                  <Stack.Screen
                    name="job/[id]"
                    options={({ route }) => ({
                      title: `J-${(route.params as JobScreenParams)?.id}`,
                      headerBackVisible: true,
                    })}
                  />
                  <Stack.Screen name="login" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="register"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="lost-password"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="location-permission"
                    options={{ headerShown: false }}
                  />
                </Stack>
              </ThemeProvider>
            </SafeAreaProvider>
          </NotificationsWrapper>
        </UserProvider>
      </NotificationsProvider>
    </AuthProvider>
  );
});
