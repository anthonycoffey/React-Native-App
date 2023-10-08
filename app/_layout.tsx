import React, { useEffect } from "react";
import { ThemeProvider, createTheme, Text } from "@rneui/themed";
import { Slot, router, usePathname } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Header, Icon } from "@rneui/themed";
import { TouchableOpacity } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider } from "react-native-safe-area-context";

type Token = string | null;

export default function Layout() {
  const [token, setToken] = React.useState<Token | null>(null);
  const path = usePathname();
  console.log({ path });

  useEffect(() => {
    const getData = async () => {
      try {
        const value = await AsyncStorage.getItem("token");
        setToken(value);
      } catch (e) {
        // error reading value
      }
    };
    getData();
  });

  const Menu = () => {
    return token ? (
      <TouchableOpacity>
        <View
          style={{
            justifyContent: "center",
            alignContent: "center",
            alignItems: "center",
          }}
        >
          <Icon name="menu" color="#fff" />
          <Text style={{ color: "white" }}>Menu</Text>
        </View>
      </TouchableOpacity>
    ) : null;
  };

  const GoBack = () => {
    const back = async () => {
      router.back();
    };
    return (
      <TouchableOpacity onPress={back}>
        <View
          style={{
            justifyContent: "center",
            alignContent: "center",
            alignItems: "center",
          }}
        >
          <Icon name="arrow-back" color="#fff" />
          <Text style={{ color: "white" }}>Go Back</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const Logout = () => {
    const handleLogout = async () => {
      await AsyncStorage.removeItem("token");
      setToken(null);
      router.replace("/");
    };

    // Render the component only if 'token' is present
    return token ? (
      <TouchableOpacity onPress={handleLogout}>
        <View>
          <Icon name="logout" color="#fff" />
          <Text style={styles.text}>Logout</Text>
        </View>
      </TouchableOpacity>
    ) : null;
  };

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

  return (
    <ThemeProvider theme={theme}>
      <SafeAreaProvider>
        <Header
          leftComponent={path.includes("job") ? <GoBack /> : <Menu />}
          rightComponent={<Logout />}
        />
        <Slot />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

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

const styles = StyleSheet.create({
  headerContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#397af8",
    marginBottom: 20,
    width: "100%",
    paddingVertical: 15,
  },
  heading: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  headerRight: {
    display: "flex",
    flexDirection: "row",
    marginTop: 5,
  },
  subheaderText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
