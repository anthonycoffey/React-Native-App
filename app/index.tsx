import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@rneui/themed';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme, Text } from 'react-native';
import { Stack, Link } from 'expo-router';
import LoginForm from '../components/app/LoginForm';

SplashScreen.preventAutoHideAsync();

export default function () {
  return (
    <SafeAreaProvider>
      <LoginForm />
    </SafeAreaProvider>
  );
}
