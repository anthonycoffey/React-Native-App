import React from "react";
import { Input, Stack } from "tamagui";
import { LabelText } from "@/components/Typography";
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
  editable,
  readOnly,
  onChangeText,
  ...props
}: CurrencyInputProps & React.ComponentProps<typeof Input>) {
  return (
    <Stack>
      <LabelText style={{ marginBottom: 5 }}>{label}</LabelText>
      <Input
        size={"$5"}
        keyboardType="numeric"
        value={value}
        editable={editable}
        disabled={readOnly}
        onChangeText={onChangeText}
        {...props}
      />
    </Stack>
  );
}

// import React, { useState } from 'react';
// import { TextInput } from 'react-native';
//
// const CurrencyInput = () => {
//   const [value, setValue] = useState('');
//
//   const handleTextChange = (text) => {
//     // Remove non-numeric characters
//     let cleanedText = text.replace(/[^0-9.]/g, '');
//
//     // Handle multiple decimal points
//     const splitText = cleanedText.split('.');
//     if (splitText.length > 2) {
//       cleanedText = splitText[0] + '.' + splitText[1];
//     }
//
//     // Limit decimal places to 2
//     const decimalSplit = cleanedText.split('.');
//     if (decimalSplit.length === 2 && decimalSplit[1].length > 2) {
//       cleanedText = decimalSplit[0] + '.' + decimalSplit[1].slice(0, 2);
//     }
//
//     setValue(cleanedText);
//   };
//
//   return (
//     <TextInput
//       value={value}
//       onChangeText={handleTextChange}
//       keyboardType="numeric"
//       placeholder="Enter amount"
//     />
//   );
// };
//
// export default CurrencyInput;
