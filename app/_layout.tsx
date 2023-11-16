import React from "react";
import { TamaguiProvider } from "tamagui";
import config from "@/tamagui.config";
import { Slot } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SessionProvider } from "@/ctx";

export default function Layout() {
  console.log(config);
  return (
    <TamaguiProvider config={config}>
      <SessionProvider>
        <SafeAreaProvider>
          <Slot />
        </SafeAreaProvider>
      </SessionProvider>
    </TamaguiProvider>
  );
}
