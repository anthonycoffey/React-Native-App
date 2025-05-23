import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useRouter } from 'expo-router';
import { View as ThemedView } from '@/components/Themed';
import { PrimaryButton } from '@/components/Buttons';
import { useColorScheme } from '@/components/useColorScheme';
import { getBackgroundColor } from '@/hooks/useThemeColor';

export default function LostPasswordScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: getBackgroundColor(colorScheme) }}>
      <ThemedView style={styles.container}>
        <WebView
          source={{ uri: 'https://app.24hrcarunlocking.com/reset-password' }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
        />
        <ThemedView style={styles.buttonContainer}>
          <PrimaryButton
            title="Back to Login"
            onPress={() => router.push('/login')}
          />
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  webview: {
    flex: 1,
    marginBottom: 15,
  },
  buttonContainer: {
    // ThemedView provides its own background, so no need to set it here
  },
});
