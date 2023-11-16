import React from "react";
import { View, Text } from "tamagui";

export default function Chip({ text }: { text: string }) {
  return (
    <View
      style={{
        backgroundColor: "#eee",
        borderRadius: 4,
        padding: 4,
        margin: 4,
      }}
    >
      <Text>{text}</Text>
    </View>
  );
}
