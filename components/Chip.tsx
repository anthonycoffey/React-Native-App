import React from "react";
import { View, Text } from "tamagui";
type Props = {
  children: React.ReactNode;
};
export default function Chip({ children }: Props) {
  const removeDash = (str: string) => {
    return str.replace(/-/g, " ");
  };

  return (
    <Text
      fontWeight={"800"}
      letterSpacing={1}
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
      {removeDash(children)}
    </Text>
  );
}
