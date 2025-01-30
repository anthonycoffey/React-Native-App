import React from "react";
import { Platform, StatusBar } from "react-native";
import { Separator, View, XStack, YStack } from "tamagui";
import { UserCog } from "@tamagui/lucide-icons";
import { CardTitle } from "@/components/Typography";
import { PrimaryButton, OutlinedButton } from "@/components/Buttons";
import { useSession } from "@/ctx";
import globalStyles from "@/styles/globalStyles";

export default function UserSettingsPage() {
  const { signOut } = useSession();

  const handleClockIn = () => {};

  return (
    <View
      style={globalStyles.container}
      paddingTop={Platform.OS === "android" ? StatusBar.currentHeight : 0}
      flexDirection={"column"}
    >
      <YStack>
        <XStack paddingHorizontal={20} marginTop={20} justifyContent="center">
          <UserCog />
          <CardTitle marginLeft={5}>Account Settings</CardTitle>
        </XStack>
        <Separator />
      </YStack>
      <YStack flex={1} style={{ justifyContent: "space-between" }}>
        <PrimaryButton onPress={() => handleClockIn()}>Clock In</PrimaryButton>
        <OutlinedButton
          marginTop={20}
          style={{ marginBottom: 20, borderColor: "$red10", color: "$red10" }}
          onPress={() => signOut()}
        >
          Log Out
        </OutlinedButton>
      </YStack>
    </View>
  );
}
