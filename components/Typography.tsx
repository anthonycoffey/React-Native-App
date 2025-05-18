import React from 'react';
import { StyleSheet } from 'react-native';
import { Text as ThemedText } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';

type TypographyProps = {
  children: React.ReactNode;
  style?: any;
};

export const LabelText = ({ children, style }: TypographyProps) => {
  return <ThemedText style={[styles.label, style]}>{children}</ThemedText>;
};

export const HeaderText = ({ children, style }: TypographyProps) => {
  return <ThemedText style={[styles.header, style]}>{children}</ThemedText>;
};

export const CardTitle = ({ children, style }: TypographyProps) => {
  return <ThemedText style={[styles.cardTitle, style]}>{children}</ThemedText>;
};

export const ErrorText = ({ children, style }: TypographyProps) => {
  const errorTextColor = useThemeColor(
    { light: Colors.light.errorText, dark: Colors.dark.errorText },
    'errorText'
  );
  return <ThemedText style={[styles.errorBase, { color: errorTextColor }, style]}>{children}</ThemedText>;
};

export const MenuText = ({ children, style }: TypographyProps) => {
  return <ThemedText style={[styles.menu, style]}>{children}</ThemedText>;
};

const styles = StyleSheet.create({
  label: {
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 8,
    marginLeft: 8,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  errorBase: {
    fontSize: 14,
    letterSpacing: 0.4,
    lineHeight: 18,
    textAlign: 'center',
    paddingVertical: 10,
  },
  menu: {
    fontSize: 14,
    textAlign: 'center',
  },
});
