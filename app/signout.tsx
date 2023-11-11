import * as SplashScreen from "expo-splash-screen";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { Text, Button } from "@rneui/themed";
import { useSession } from "@/ctx";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const { signOut } = useSession();
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1 }}>
        <Text h3>hello you are logged in</Text>
        <Button
          onPress={() => {
            signOut();
          }}
        >
          Logout
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
