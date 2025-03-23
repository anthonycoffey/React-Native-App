import React from 'react';
import { Text, StyleSheet } from 'react-native';

type TypographyProps = {
  children: React.ReactNode;
  style?: any;
};

export const LabelText = ({ children, style }: TypographyProps) => {
  return <Text style={[styles.label, style]}>{children}</Text>;
};

export const HeaderText = ({ children, style }: TypographyProps) => {
  return <Text style={[styles.header, style]}>{children}</Text>;
};

export const CardTitle = ({ children, style }: TypographyProps) => {
  return <Text style={[styles.cardTitle, style]}>{children}</Text>;
};

export const ErrorText = ({ children, style }: TypographyProps) => {
  return <Text style={[styles.error, style]}>{children}</Text>;
};

export const MenuText = ({ children, style }: TypographyProps) => {
  return <Text style={[styles.menu, style]}>{children}</Text>;
};

const styles = StyleSheet.create({
  label: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#424242',
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
  error: {
    color: 'red',
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
