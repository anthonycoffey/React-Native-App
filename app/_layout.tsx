import React, { useEffect } from "react";
import { TamaguiProvider, View } from "tamagui";
import config from "@/tamagui.config";
import { Slot } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SessionProvider } from "@/ctx";
import { useFonts } from "expo-font";
import ToolbarMenu from "@/components/ToolbarMenu";

export default function Layout() {
  const [loaded] = useFonts({
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
  });
  useEffect(() => {
    if (loaded) {
      // can hide splash screen here
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

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
