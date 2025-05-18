import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { Text, View as ThemedView } from "@/components/Themed";
import { useColorScheme } from "./useColorScheme"; // Re-enable for dynamic theming
import Colors from "@/constants/Colors"; // Import full Colors object

type Props = {
  children: string;
  style?: ViewStyle; // Allow passing custom style for the container
};

export default function Chip({ children, style }: Props) {
  const theme = useColorScheme() ?? 'light';

  const removeDash = (str: string) => {
    return typeof str === 'string' ? str.replace(/-/g, " ").toUpperCase() : str;
  };

  // Define chip colors dynamically based on the theme
  const chipBackgroundColor = theme === 'light' ? Colors.light.tabIconDefault : Colors.dark.tabIconDefault;
  // Ensure chipTextColor provides good contrast with chipBackgroundColor
  // Using the general theme text color might be okay if tabIconDefault is a neutral grey
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
    flexShrink: 1, // Allow chip to shrink if needed, not grow
    borderRadius: 16, // More pill-like
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 5,
    marginVertical: 5,
    alignSelf: 'flex-start', // Ensure it doesn't stretch full width by default
  },
  chipText: {
    fontWeight: "600", // Adjusted from 800
    fontSize: 12, // Slightly smaller
    letterSpacing: 0.5, // Adjusted
  }
});
