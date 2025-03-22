import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
}

// Primary Button
export const PrimaryButton = ({ title, onPress, style, ...props }: ButtonProps) => {
  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        styles.primaryButton, 
        style
      ]} 
      onPress={onPress}
      {...props}
    >
      <Text style={styles.primaryButtonText}>{title}</Text>
    </TouchableOpacity>
  );
};

// Secondary Button
export const SecondaryButton = ({ title, onPress, style, ...props }: ButtonProps) => {
  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        styles.secondaryButton, 
        style
      ]} 
      onPress={onPress}
      {...props}
    >
      <Text style={styles.secondaryButtonText}>{title}</Text>
    </TouchableOpacity>
  );
};

// Outline Button
export const OutlinedButton = ({ title, onPress, style, ...props }: ButtonProps) => {
  const colorScheme = useColorScheme();
  const textColor = colorScheme === 'dark' ? Colors.dark.text : Colors.light.text;
  
  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        styles.outlinedButton, 
        { borderColor: textColor },
        style
      ]} 
      onPress={onPress}
      {...props}
    >
      <Text style={[styles.outlinedButtonText, { color: textColor }]}>{title}</Text>
    </TouchableOpacity>
  );
};

// Warning Button
export const WarningButton = ({ title, onPress, style, ...props }: ButtonProps) => {
  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        styles.warningButton, 
        style
      ]} 
      onPress={onPress}
      {...props}
    >
      <Text style={styles.warningButtonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  primaryButton: {
    backgroundColor: '#0a7ea4',
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#65b9d6',
  },
  secondaryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  outlinedButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  outlinedButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  warningButton: {
    backgroundColor: '#e53935',
  },
  warningButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  }
});