import React from "react";
import { View, Text } from "tamagui";
type Props = {
  children: React.ReactNode;
};
export default function Chip({ children }: Props) {
  return (
    <Text
      backgroundColor="blue"
      style={{
        flexShrink: 1,
        borderRadius: 4,
        padding: 5,
        marginRight: 5,
        marginVertical: 5,
      }}
      color="white"
    >
      {children}
    </Text>
  );
}
