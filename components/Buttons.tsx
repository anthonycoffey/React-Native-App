import {
  TouchableOpacity,
  StyleSheet,
  TouchableOpacityProps,
  ViewStyle, // Added for StyleProp
  StyleProp, // Added for StyleProp
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // Added
import Colors, { buttonVariants, ui } from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor'; // Added
import { Text } from '@/components/Themed';

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

// Chip Button
export const ChipButton = ({
  title,
  onPress,
  style,
  variant, // Allow variant for color consistency if needed
  disabled,
  ...props
}: ButtonProps & { disabled?: boolean }) => {
  const colorScheme = useColorScheme();
  const defaultTextColor =
    colorScheme === 'dark' ? Colors.dark.text : Colors.light.text;

  // Use variant color if provided, otherwise default text color for outline
  const chipColor = variant ? buttonVariants[variant] : defaultTextColor;

  return (
    <TouchableOpacity
      style={[
        styles.chipButtonBase, // Base style for chip
        { borderColor: chipColor },
        disabled && styles.disabledChipButton, // Specific disabled style for chip if needed
        style, // Allow overriding with external styles
      ]}
      onPress={!disabled ? onPress : undefined}
      activeOpacity={disabled ? 1 : 0.7}
      {...props}
    >
      <Text
        style={[
          styles.chipButtonText,
          { color: chipColor },
          disabled && styles.disabledChipButtonText, // Specific disabled text style
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
    borderColor: ui.disabled.background, // Ensure border also changes for outlined disabled
  },
  disabledButtonText: {
    color: ui.disabled.text,
  },
  // ChipButton specific styles
  chipButtonBase: {
    borderWidth: 1,
    borderRadius: 16, // More rounded for chip-like appearance
    paddingVertical: 6,
    paddingHorizontal: 12, // Adjusted from 10 to 12 for a bit more space
    alignItems: 'center',
    justifyContent: 'center',
    // minWidth: 0, // Let it size naturally or set a small minWidth if preferred
  },
  chipButtonText: {
    fontWeight: '600', // Can be adjusted if a lighter font is preferred
    fontSize: 13, // Smaller font size
    textTransform: 'uppercase', // Already handled by .toUpperCase() on title, but good for explicitness
  },
  disabledChipButton: { // If specific disabled style for chip is needed
    backgroundColor: 'transparent', // Keep outline style
    borderColor: ui.disabled.background,
  },
  disabledChipButtonText: { // If specific disabled text style for chip is needed
    color: ui.disabled.text,
  },
});

// Icon Button
export interface IconButtonProps extends TouchableOpacityProps {
  iconName: React.ComponentProps<typeof MaterialIcons>['name'];
  iconSize?: number;
  iconColor?: string;
  // onPress is part of TouchableOpacityProps
  // disabled is part of TouchableOpacityProps
  // style is part of TouchableOpacityProps (for the TouchableOpacity container)
}

export function IconButton({
  iconName,
  iconSize = 24,
  iconColor,
  style,
  disabled,
  onPress, // Explicitly destructure onPress to pass to TouchableOpacity
  ...props // Pass other TouchableOpacityProps
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
