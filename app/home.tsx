import React, { useState } from 'react';
import {
  ThemeProvider,
  createTheme,
  Card,
  ListItem,
  Button,
  Icon,
} from '@rneui/themed';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme, Text, View, Image } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function () {
  return (
    <SafeAreaProvider>
      <View>
        <Text>Home</Text>
        {/* <Image source={require('@/assets/images/icon.png')}></Image> */}
      </View>
    </SafeAreaProvider>
  );
}
