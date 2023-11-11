import React from "react";
import { ThemeProvider, createTheme, Text } from "@rneui/themed";
import { Slot, router, usePathname } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SessionProvider } from "../ctx";

export default function Layout() {
  return (
    <ThemeProvider theme={theme}>
      <SessionProvider>
        <SafeAreaProvider>
          <Slot />
        </SafeAreaProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
const styles = {
  container: {
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
  },
  text: {
    color: "white",
  },
};

const theme = createTheme({
  lightColors: {
    primary: "#1818a5",
  },
  darkColors: {
    primary: "#222222",
  },
  mode: "light",
  components: {
    Text: {
      h1Style: {
        fontSize: 32,
      },
    },
  },
});
