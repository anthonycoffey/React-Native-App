import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps,
} from 'react-native';
import Colors, { buttonVariants, ui } from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: 'error' | 'warning' | 'success' | 'primary' | 'secondary';
}

// Primary Button
export const PrimaryButton = ({
  title,
  onPress,
  style,
  disabled,
  variant,
  ...props
}: ButtonProps & { disabled?: boolean }) => {
  const backgroundColor = variant
    ? buttonVariants[variant]
    : buttonVariants.primary;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles.primaryButton,
        variant && { backgroundColor },
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={!disabled ? onPress : undefined}
      activeOpacity={disabled ? 1 : 0.7}
      {...props}
    >
      <Text
        style={[
          styles.primaryButtonText,
          disabled && styles.disabledButtonText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

// Secondary Button
export const SecondaryButton = ({
  title,
  onPress,
  style,
  disabled,
  variant,
  ...props
}: ButtonProps & { disabled?: boolean }) => {
  const backgroundColor = variant
    ? buttonVariants[variant]
    : buttonVariants.secondary;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles.secondaryButton,
        variant && { backgroundColor },
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={!disabled ? onPress : undefined}
      activeOpacity={disabled ? 1 : 0.7}
      {...props}
    >
      <Text
        style={[
          styles.secondaryButtonText,
          disabled && styles.disabledButtonText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

// Outline Button
export const OutlinedButton = ({
  title,
  onPress,
  style,
  variant,
  disabled,
  ...props
}: ButtonProps & { disabled?: boolean }) => {
  const colorScheme = useColorScheme();
  const defaultTextColor =
    colorScheme === 'dark' ? Colors.dark.text : Colors.light.text;

  const textColor = variant ? buttonVariants[variant] : defaultTextColor;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles.outlinedButton,
        { borderColor: textColor },
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={!disabled ? onPress : undefined}
      activeOpacity={disabled ? 1 : 0.7}
      {...props}
    >
      <Text
        style={[
          styles.outlinedButtonText,
          { color: textColor },
          disabled && styles.disabledButtonText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

// Warning Button
export const WarningButton = ({
  title,
  onPress,
  style,
  disabled,
  variant,
  ...props
}: ButtonProps & { disabled?: boolean }) => {
  const backgroundColor = variant
    ? buttonVariants[variant]
    : buttonVariants.error;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles.warningButton,
        variant && { backgroundColor },
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={!disabled ? onPress : undefined}
      activeOpacity={disabled ? 1 : 0.7}
      {...props}
    >
      <Text
        style={[
          styles.warningButtonText,
          disabled && styles.disabledButtonText,
        ]}
      >
        {title}
      </Text>
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
    backgroundColor: buttonVariants.primary,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: buttonVariants.secondary,
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
    backgroundColor: buttonVariants.error,
  },
  warningButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: ui.disabled.background,
  },
  disabledButtonText: {
    color: ui.disabled.text,
  },
});
