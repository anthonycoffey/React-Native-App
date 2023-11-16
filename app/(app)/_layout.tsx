import { Redirect, router, Slot, usePathname } from "expo-router";
import { useSession } from "@/ctx";
import { Header, Text } from "tamagui";
import { TouchableOpacity } from "react-native-gesture-handler";
import { View } from "react-native";
import React from "react";

export default function AppLayout() {
  const { session, isLoading, signOut } = useSession();
  const path = usePathname();

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (!session) {
    return <Redirect href="/" />;
  }

  const Menu = () => {
    return (
      <TouchableOpacity>
        <View
          style={{
            justifyContent: "center",
            alignContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white" }}>Menu</Text>
        </View>
      </TouchableOpacity>
    );
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
          <Text style={{ color: "white" }}>Go Back</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const Logout = () => {
    const handleLogout = async () => {
      signOut();
    };
    return (
      <TouchableOpacity onPress={handleLogout}>
        <View>
          <Text style={styles.text}>Logout</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Header
      // leftComponent={path.includes("job") ? <GoBack /> : <Menu />}
      // rightComponent={<Logout />}
      />
      <Slot />
    </>
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
