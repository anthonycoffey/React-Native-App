import React from "react";
import { View } from "react-native";
import { Input } from "@rneui/themed";
import globalStyles from "../../../../styles/globalStyles";

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
  editable,
  readOnly,
  onChangeText,
}: Props) {
  const formatCurrency = (text: string) => {
    // Remove any non-numeric characters
    const numericValue = +text.replace(/[^0-9.]/g, "");
    const formattedValue = parseFloat(numericValue).toFixed(2);
    onChangeText(formattedValue);
  };

  return (
    <Input
      style={globalStyles.input}
      inputContainerStyle={{ borderBottomWidth: 0 }}
      containerStyle={{
        width: "48%",
      }}
      label={label}
      keyboardType="numeric"
      value={value}
      editable={editable}
      disabled={readOnly}
      onChangeText={formatCurrency}
    />
  );
}
