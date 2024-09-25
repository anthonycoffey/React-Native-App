import React from "react";
import { View, Text, Button, Image, XStack, YStack } from "tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HeaderToolbar() {
  const insets = useSafeAreaInsets();

  return (
    <YStack
      height={80 + insets.top}
      paddingTop={insets.top}
      alignItems="center"
      style={{ backgroundColor: "#252c3a" }}
      borderBottomColor={"#ececec"}
      borderBottomWidth={1}
    >
      <XStack>
        <Image
          source={{
            width: 75,
            height: 75,
            uri: require("@/assets/images/logo.png"),
          }}
          width={75}
        />
      </XStack>
    </YStack>
  );
}
