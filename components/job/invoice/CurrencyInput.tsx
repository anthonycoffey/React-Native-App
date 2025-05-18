import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import globalStyles from '@/styles/globalStyles';
import { LabelText } from '@/components/Typography';
import { View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import {
  getInputBackgroundColor,
  getTextColor,
  getPlaceholderTextColor,
} from '@/hooks/useThemeColor';

type Props = {
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
}: Props) {
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

  const colorScheme = useColorScheme() ?? 'light';

  return (
    <View style={styles.container}>
      <LabelText style={styles.label}>{label}</LabelText>
      <TextInput
        style={[
          globalStyles.input,
          styles.input,
          {
            color: getTextColor(colorScheme),
            backgroundColor: getInputBackgroundColor(colorScheme),
          },
        ]}
        keyboardType='numeric'
        value={value}
        editable={editable && !readOnly}
        onChangeText={handleTextChange}
        placeholderTextColor={getPlaceholderTextColor(colorScheme)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    marginLeft: 0,
  },
  input: {
    fontFamily: 'monospace',
  },
});
