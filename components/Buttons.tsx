import {
  TouchableOpacity,
  StyleSheet,
  TouchableOpacityProps,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors, { buttonVariants, ui } from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Text } from '@/components/Themed';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: 'error' | 'warning' | 'success' | 'primary' | 'secondary';
}

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

export const OutlinedButton = ({
  title,
  onPress,
  style,
  variant,
  disabled,
  ...props
}: ButtonProps & { disabled?: boolean }) => {
  const colorScheme = useColorScheme() ?? 'light';
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

export const ChipButton = ({
  title,
  onPress,
  style,
  variant,
  disabled,
  ...props
}: ButtonProps & { disabled?: boolean }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const defaultTextColor =
    colorScheme === 'dark' ? Colors.dark.text : Colors.light.text;

  const chipColor = variant ? buttonVariants[variant] : defaultTextColor;

  return (
    <TouchableOpacity
      style={[
        styles.chipButtonBase,
        { borderColor: chipColor },
        disabled && styles.disabledChipButton,
        style,
      ]}
      onPress={!disabled ? onPress : undefined}
      activeOpacity={disabled ? 1 : 0.7}
      {...props}
    >
      <Text
        style={[
          styles.chipButtonText,
          { color: chipColor },
          disabled && styles.disabledChipButtonText,
        ]}
      >
        {title.toUpperCase()}
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
    borderColor: ui.disabled.background,
  },
  disabledButtonText: {
    color: ui.disabled.text,
  },
  chipButtonBase: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipButtonText: {
    fontWeight: '600',
    fontSize: 13,
    textTransform: 'uppercase',
  },
  disabledChipButton: {
    backgroundColor: 'transparent',
    borderColor: ui.disabled.background,
  },
  disabledChipButtonText: {
    color: ui.disabled.text,
  },
});

export interface IconButtonProps extends TouchableOpacityProps {
  iconName: React.ComponentProps<typeof MaterialIcons>['name'];
  iconSize?: number;
  iconColor?: string;
}

export function IconButton({
  iconName,
  iconSize = 24,
  iconColor,
  style,
  disabled,
  onPress,
  ...props
}: IconButtonProps) {
  const defaultIconColor = useThemeColor({}, 'icon');
  const actualIconColor = iconColor || defaultIconColor;

  return (
    <TouchableOpacity
      style={style}
      disabled={disabled}
      onPress={!disabled ? onPress : undefined}
      activeOpacity={disabled ? 1 : 0.7}
      {...props}
    >
      <MaterialIcons name={iconName} size={iconSize} color={actualIconColor} />
    </TouchableOpacity>
  );
}
