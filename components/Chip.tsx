import React from "react";
import { Text, StyleSheet } from "react-native";

type Props = {
  children: string;
};

export default function Chip({ children }: Props) {
  const removeDash = (str: string) => {
    return typeof str === 'string' ? str.replace(/-/g, " ").toUpperCase() : str;
  };

  return (
    <Text style={styles.chip}>
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