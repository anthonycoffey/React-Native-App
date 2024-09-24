import React from "react";
import { Platform, StatusBar } from "react-native";
import { View, XStack } from "tamagui";
import { UserCog } from "@tamagui/lucide-icons";
import { CardTitle } from "@/components/Typography";
import { PrimaryButton } from "@/components/Buttons";
import { useSession } from "@/ctx";
import globalStyles from "@/styles/globalStyles";

export default function UserSettingsPage() {
  const { signOut } = useSession();
  return (
    <View
      style={globalStyles.container}
      paddingTop={Platform.OS === "android" ? StatusBar.currentHeight : 0}
      flexDirection={"column"}
    >
      <XStack paddingHorizontal={20} marginTop={20} justifyContent="center">
        <UserCog />
        <CardTitle marginLeft={5}>Account Settings</CardTitle>
      </XStack>
      <XStack flex={1}>
        <PrimaryButton
          marginTop={20}
          backgroundColor="red"
          width="100%"
          onPress={() => signOut()}
        >
          Log Out
        </PrimaryButton>
      </XStack>
    </View>
  );
}
