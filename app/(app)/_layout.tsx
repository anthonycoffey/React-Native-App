import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityIndicator } from 'react-native';
import { View } from '@/components/Themed';
import { JobScreenParams } from '@/types';

export default function AppLayout() {
  const auth = useAuth();
  const session = auth?.session;
  const isLoading = auth?.isLoading;

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack>
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen 
        name="job/[id]" 
        options={({ route }) => ({
           title: `J-${(route.params as JobScreenParams)?.id}`,
           headerBackVisible: true,
        })} 
      />
      <Stack.Screen
         name="actions/accept-job/[jobId]"
         options={{ title: 'Accept Job?', headerBackVisible: true }}
      />
      <Stack.Screen 
         name="location-permission" 
         options={{ headerShown: false }} 
      />
    </Stack>
  );
}
