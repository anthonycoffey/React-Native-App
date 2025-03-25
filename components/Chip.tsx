import React from "react";
import { StyleSheet } from "react-native";
import { Text } from "@/components/Themed";

type Props = {
  children: string;
};

export default function Chip({ children }: Props) {
  const removeDash = (str: string) => {
    return typeof str === 'string' ? str.replace(/-/g, " ").toUpperCase() : str;
  };

  return (
    <Text style={styles.chip} lightColor="white" darkColor="white">
      {removeDash(children)}
    </Text>
  );
}

const styles = StyleSheet.create({
  chip: {
    fontWeight: "800",
    letterSpacing: 1,
    backgroundColor: "#0a7ea4",
    flexShrink: 1,
    borderRadius: 4,
    padding: 8,
    marginRight: 5,
    marginVertical: 5,
    color: "white",
    overflow: "hidden"
  }
});