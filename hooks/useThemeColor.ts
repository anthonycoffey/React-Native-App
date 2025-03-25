/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useColorScheme as RNUseColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

export function getBackgroundColor(theme: 'light' | 'dark') {
  return theme === 'dark' ? Colors.dark.background : '#fff';
}

export function getTextColor(theme: 'light' | 'dark') {
  return theme === 'dark' ? Colors.dark.text : Colors.light.text;
}

export function getBorderColor(theme: 'light' | 'dark') {
  return theme === 'dark' ? '#444' : '#eee';
}

export function getIconColor(theme: 'light' | 'dark') {
  return theme === 'dark' ? Colors.dark.icon : Colors.light.icon;
}

export function getInputBackgroundColor(theme: 'light' | 'dark') {
  return theme === 'dark' ? '#2c2c2c' : '#fff';
}

export function getPlaceholderTextColor(theme: 'light' | 'dark') {
  return theme === 'dark' ? '#9BA1A6' : '#687076';
}