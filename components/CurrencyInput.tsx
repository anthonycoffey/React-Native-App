import React from "react";
import { View, TextInput, StyleSheet, Text, TextInputProps } from "react-native";

type CurrencyInputProps = {
  label: string;
  value: string;
  editable?: boolean;
  readOnly?: boolean;
  onChangeText: (text: string) => void;
};

export default function CurrencyInput({
  label,
  value,
  editable = true,
  readOnly = false,
  onChangeText,
  ...props
}: CurrencyInputProps & TextInputProps) {
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
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={value}
        editable={editable && !readOnly}
        onChangeText={handleTextChange}
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
    color: "#424242",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
  }
});