import React from "react";
import { Text, XStack, YStack } from "tamagui";
import { router, usePathname, useRootNavigation } from "expo-router";
import { Home, Briefcase, Settings } from "@tamagui/lucide-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TouchableOpacity, StyleSheet } from "react-native";

export default function HeaderToolbar() {
  const insets = useSafeAreaInsets();
  const path = usePathname();
  const activeStyle = styles.active;
  const inactiveStyle = styles.inactive;

  const go = (route: any) => {
    router.push(route);
  };

  return (
    <YStack
      alignItems="center"
      backgroundColor={"#eeeded"}
      borderTopColor={"#d3d3d3"}
      borderTopWidth={1}
      elevation={10}
      elevationAndroid={10}
    >
      <XStack height={60 + insets.bottom} paddingBottom={insets.bottom}>
        <TouchableOpacity
          disabled
          style={styles.disabled}
          onPress={() => console.log("dashboard")}
        >
          <Home size={18} />
          <Text>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={path === "/" ? activeStyle : inactiveStyle}
          onPress={() => go("(app)/")}
        >
          <Briefcase size={18} />
          <Text>My Jobs</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={path === "/settings" ? activeStyle : inactiveStyle}
          onPress={() => go("(app)/settings")}
        >
          <Settings size={18} />
          <Text>Settings</Text>
        </TouchableOpacity>
      </XStack>
    </YStack>
  );
}

// Define your styles here
const styles = StyleSheet.create({
  active: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e1e1e1",
  },
  inactive: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  disabled: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.25,
  },
});
