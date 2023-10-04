import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@rneui/themed';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme, Text } from 'react-native';
import { Stack, Link } from 'expo-router';
import LoginForm from '../components/app/LoginForm';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Token = string | null;

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [token, setToken] = React.useState<Token | null>(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const value = await AsyncStorage.getItem('token');
        setToken(value);
      } catch (e) {
        // error reading value
        console.log(e);
      }
    };
    getData();
  }, []);

  return (
    <SafeAreaProvider>
      <LoginForm />
    </SafeAreaProvider>
  );
}
