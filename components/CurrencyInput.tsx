import React from "react";
import { View, TextInput, StyleSheet, Text, TextInputProps } from "react-native";
import { useColorScheme } from '@/components/useColorScheme';
import { 
  useThemeColor, 
  getBorderColor, 
  getPlaceholderTextColor, 
  getInputBackgroundColor,
  getTextColor
} from '@/hooks/useThemeColor';

type CurrencyInputProps = {
  label: string;
  value: string;
  editable?: boolean;
  readOnly?: boolean;
  onChangeText: (text: string) => void;
  placeholder?: string; // Added placeholder prop
};

export default function CurrencyInput({
  label,
  value,
  editable = true,
  readOnly = false,
  onChangeText,
  placeholder, // Added placeholder prop
  ...props
}: CurrencyInputProps & TextInputProps) {
  const theme = useColorScheme() ?? 'light';

  const themedLabelColor = getTextColor(theme);
  const themedInputBorderColor = getBorderColor(theme);
  const themedInputBackgroundColor = getInputBackgroundColor(theme);
  const themedInputTextColor = getTextColor(theme);
  const themedPlaceholderTextColor = getPlaceholderTextColor(theme);

  const handleTextChange = (text: string) => {
    // Remove non-numeric characters
    let cleanedText = text.replace(/[^0-9.]/g, '');

    // Handle multiple decimal points
    const splitText = cleanedText.split('.');
    if (splitText.length > 2) {
      cleanedText = splitText[0] + '.' + splitText[1];
    }

    // Limit decimal places to 2
    const decimalSplit = cleanedText.split('.');
    if (decimalSplit.length === 2 && decimalSplit[1].length > 2) {
      cleanedText = decimalSplit[0] + '.' + decimalSplit[1].slice(0, 2);
    }

    onChangeText(cleanedText);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: themedLabelColor }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          { 
            borderColor: themedInputBorderColor, 
            backgroundColor: themedInputBackgroundColor,
            color: themedInputTextColor 
          }
        ]}
        keyboardType="numeric"
        value={value}
        editable={editable && !readOnly}
        onChangeText={handleTextChange}
        placeholder={placeholder} // Use placeholder prop
        placeholderTextColor={themedPlaceholderTextColor}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    // color: "#424242", // Replaced by themed color
  },
  input: {
    borderWidth: 1,
    // borderColor: "#ccc", // Replaced by themed color
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    // Hardcoded colors removed, will be applied dynamically
  }
});
