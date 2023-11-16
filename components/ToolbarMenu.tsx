import React from "react";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Menu } from "@tamagui/lucide-icons";
import { Button, XStack, Text, Stack, View } from "tamagui";

export default function HeaderToolbar() {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        borderColor: "#e7e7e7",
        paddingHorizontal: 10,
        paddingTop: insets.top,
        paddingBottom: 10,
        shadowColor: "#171717",
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowOpacity: 0.17,
        shadowRadius: 3.05,
        elevation: 2,
      }}
    >
      <XStack
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        height={50} // Adjust as needed
      >
        <Text>Phoenix Mobile</Text>
        <Button
          icon={Menu}
          onPress={() => console.log("Menu Pressed")} // Replace with actual functionality
        />
      </XStack>
    </View>
  );
}
