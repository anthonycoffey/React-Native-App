import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { Text, View as ThemedView } from "@/components/Themed";
import { useColorScheme } from "./useColorScheme";
import Colors from "@/constants/Colors";

type Props = {
  children: string;
  style?: ViewStyle;
};

export default function Chip({ children, style }: Props) {
  const theme = useColorScheme() ?? 'light';

  const removeDash = (str: string) => {
    return typeof str === 'string' ? str.replace(/-/g, " ").toUpperCase() : str;
  };

  const chipBackgroundColor = theme === 'light' ? Colors.light.tabIconDefault : Colors.dark.tabIconDefault;
  const chipTextColor = Colors[theme].text;

  return (
    <ThemedView style={[
      styles.chipContainer,
      { backgroundColor: chipBackgroundColor },
      style
    ]}>
      <Text style={[styles.chipText, { color: chipTextColor }]}>
        {removeDash(children)}
      </Text>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  chipContainer: {
    flexShrink: 1,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 5,
    marginVertical: 5,
    alignSelf: 'flex-start',
  },
  chipText: {
    fontWeight: "600",
    fontSize: 12,
    letterSpacing: 0.5,
  }
});
